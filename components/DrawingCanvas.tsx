import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export interface DrawingCanvasRef {
  setColor: (color: string) => void;
  setPage:  (uri: string)   => void;
  undo:     ()              => void;
  clear:    ()              => void;
  save:     (bgBase64: string) => void;
}

interface Props {
  bgUri:       string;
  size:        number;
  onSaveData:  (dataUrl: string) => void;
}

// WebView renders background + canvas — no touch handling inside HTML
function buildHTML(bgUri: string, size: number) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
  <style>
    * { margin:0; padding:0; }
    html, body { width:${size}px; height:${size}px; overflow:hidden; background:#fff; }
    #bg {
      position:absolute; top:0; left:0; width:100%; height:100%;
      background-image:url('${bgUri}');
      background-size:contain;
      background-repeat:no-repeat;
      background-position:center;
    }
    #c { position:absolute; top:0; left:0; }
  </style>
</head>
<body>
  <div id="bg"></div>
  <canvas id="c" width="${size}" height="${size}"></canvas>
  <script>
    var canvas   = document.getElementById('c');
    var ctx      = canvas.getContext('2d');
    var penColor = '#1a1a1a';
    var penSize  = 6;
    var eraser   = false;
    var drawing  = false;
    var strokes  = [];        // committed strokes (each is an array of points + style)
    var current  = null;      // stroke in progress

    function replayStrokes() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < strokes.length; i++) {
        drawStroke(strokes[i]);
      }
    }

    function drawStroke(s) {
      if (s.points.length === 0) return;
      ctx.globalCompositeOperation = s.eraser ? 'destination-out' : 'source-over';
      // dot for single tap
      if (s.points.length === 1) {
        ctx.beginPath();
        ctx.arc(s.points[0].x, s.points[0].y, s.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        return;
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth   = s.size;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (var j = 1; j < s.points.length; j++) {
        ctx.lineTo(s.points[j].x, s.points[j].y);
      }
      ctx.stroke();
    }

    // Called from React Native via injectJavaScript
    function startDraw(x, y) {
      current = { color: penColor, size: penSize, eraser: eraser, points: [{x:x, y:y}] };
      drawing = true;
      // draw the initial dot immediately
      ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.arc(x, y, penSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = penColor;
      ctx.fill();
    }

    function moveDraw(x, y) {
      if (!drawing || !current) return;
      var prev = current.points[current.points.length - 1];
      current.points.push({x:x, y:y});
      ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth   = penSize;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    function endDraw() {
      if (current) { strokes.push(current); current = null; }
      drawing = false;
    }

    function setColor(c)  { penColor = c; eraser = false; }
    function setEraser(v) { eraser = v; }
    function setSize(s)   { penSize = s; }

    function undo() {
      if (strokes.length > 0) { strokes.pop(); replayStrokes(); }
    }

    function clear() {
      strokes = []; current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setPage(uri) {
      document.getElementById('bg').style.backgroundImage = "url('" + uri + "')";
      strokes = []; current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function savePage(bgData) {
      var offscreen = document.createElement('canvas');
      offscreen.width  = canvas.width;
      offscreen.height = canvas.height;
      var offCtx = offscreen.getContext('2d');

      // White background
      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(0, 0, offscreen.width, offscreen.height);

      var img = new Image();
      img.onload = function() {
        // Replicate background-size:contain; background-position:center
        var scale = Math.min(offscreen.width / img.width, offscreen.height / img.height);
        var dw = img.width  * scale;
        var dh = img.height * scale;
        var dx = (offscreen.width  - dw) / 2;
        var dy = (offscreen.height - dh) / 2;
        offCtx.drawImage(img, dx, dy, dw, dh);
        // Draw strokes on top
        offCtx.drawImage(canvas, 0, 0);
        window.ReactNativeWebView.postMessage('SAVE:' + offscreen.toDataURL('image/png'));
      };
      img.onerror = function() {
        // Fallback: strokes on white background
        offCtx.drawImage(canvas, 0, 0);
        window.ReactNativeWebView.postMessage('SAVE:' + offscreen.toDataURL('image/png'));
      };
      img.src = bgData;
    }
  </script>
</body>
</html>`;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(({ bgUri, size, onSaveData }, ref) => {
  const webviewRef = useRef<WebView>(null);
  const loadedRef  = useRef(false);

  const inject = (js: string) => {
    if (!loadedRef.current) return;
    webviewRef.current?.injectJavaScript(`${js}; true;`);
  };

  // All touch handling done in React Native — no WebView touch issues
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        inject(`startDraw(${locationX}, ${locationY})`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        inject(`moveDraw(${locationX}, ${locationY})`);
      },
      onPanResponderRelease:   () => inject(`endDraw()`),
      onPanResponderTerminate: () => inject(`endDraw()`),
    })
  ).current;

  useImperativeHandle(ref, () => ({
    setColor: (color) => inject(`setColor('${color}')`),
    setPage:  (uri)   => inject(`setPage('${uri}')`),
    undo:     ()      => inject(`undo()`),
    clear:    ()      => inject(`clear()`),
    save:     (bgBase64) => inject(`savePage(${JSON.stringify(bgBase64)})`),
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* WebView renders background + canvas — pointer events disabled so RN handles touches */}
      <WebView
        ref={webviewRef}
        source={{ html: buildHTML(bgUri, size), baseUrl: 'http://localhost' }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={["*"]}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        onLoad={() => { loadedRef.current = true; }}
        onMessage={(e) => {
          const data = e.nativeEvent.data;
          if (data.startsWith('SAVE:')) {
            onSaveData(data.slice(5));
          }
        }}
      />

      {/* Invisible touch layer — captures all gestures and forwards to WebView canvas */}
      <View
        style={StyleSheet.absoluteFill}
        {...panResponder.panHandlers}
      />
    </View>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";
export default DrawingCanvas;

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
