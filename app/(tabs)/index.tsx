
import { JSX, useCallback, useRef, useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Canvas, {
  Image as CanvasImage
} from "react-native-canvas";
import Signature from 'react-native-signature-canvas';


const pages = [

  require('../../assets/CoverPage.png'),
  require('../../assets/Scribble_Stories_Intro_Page_1.png'),
  require('../../assets/Scribble_Stories_Circle_Page_2.png'),
  require('../../assets/Scribble_Stories_Circle_Practice_Page_3.png'),
  require('../../assets/Scribble_Stories_Square_Page_4.png'),
  require('../../assets/Scribble_Stories_Square_Practice_Page_5.png'),
  require('../../assets/Scribble_Stories_Triangle_Page_6.png'),
  require('../../assets/Scribble_Stories_Triangle_Practice_Page_7.png'),
  require('../../assets/Scribble_Stories_Rectangle_Page_8.png'),
  require('../../assets/Scribble_Stories_Rectangle_Practice_Page_9.png'),
  require('../../assets/Scribble_Stories_Shapes_Together_Page_10.png'),
  require('../../assets/Scribble_Stories_Shapes_Together_Practice_Page_11.png'),
  require('../../assets/Scribble_Stories_House_Rocket_Practice_Page_12.png'),
  require('../../assets/Scribble_Stories_Train_Boat_Practice_Page_13.png'),
  require('../../assets/Scribble_Stories_Sun_Tree_Practice_Page_14.png'),
  require('../../assets/Scribble_Stories_Robot_Car_Practice_Page_15.png'),
  require('../../assets/Back_Cover.png'),
];


export default function BookScreen() {
  const [pageIndex, setPageIndex] = useState(0);
  const sigRef = useRef<any>(null);



  const goNext = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const goBack = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleOK = (sig: string) => {
    console.log('Saved drawing:', sig);
  };

  const handleClear = () => {
    if (sigRef.current) {
      sigRef.current.clearSignature();
    }
  };

  const handleCanvas = (canvas:any) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, 100, 100);
  };

  const handleImageRect = useCallback((canvas: Canvas | null) => {
    if (!canvas) return;
    const image = new CanvasImage(canvas);
    canvas.width = 100;
    canvas.height = 100;

    const context = canvas.getContext("2d");

    image.src =
      pages[pageIndex];
    image.addEventListener("load", () => {
      context.drawImage(image, 0, 0, 100, 100);
    });
  }, []);

  const [canvasStyle, setCanvasStyle] = useState(() => ``);


  const return_canvas = (pageIndex: number): JSX.Element => {
    return (
      <Signature
        ref={sigRef}
        onOK={handleOK}
        onClear={() => console.log('Canvas cleared')}
        descriptionText=""
        clearText="Clear"
        confirmText="Save"
        webStyle={`
          .m-signature-pad--footer { display: none; }
          .m-signature-pad {
            box-shadow: none;
            border: none;
            background: transparent !important;
          }
          body, html {
            background: transparent !important;
            margin: 0;
            padding: 0;
          }
          canvas {
            position: absolute;
            top: 0;
            left: 0;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-color: transparent !important;
            background-image: url(${Image.resolveAssetSource(pages[pageIndex]).uri});
          }
        `}
      />
    );
  }


    // useEffect(() => {
    //   let canvas = `
    //     .m-signature-pad--footer { display: none; }
    //     .m-signature-pad {
    //       box-shadow: none;
    //       border: none;
    //       background: transparent !important;
    //     }
    //     body, html {
    //       background: transparent !important;
    //       margin: 0;
    //       padding: 0;
    //     }
    //     canvas {
    //       position: absolute;
    //       top: 0;
    //       left: 0;
    //       background-size: contain;
    //       background-repeat: no-repeat;
    //       background-position: center;
    //       background-color: transparent !important;
    //       background-image: url(${Image.resolveAssetSource(pages[pageIndex]).uri});
    //     }
    //   `;
    //   setCanvasStyle(canvas);
    //   console.log('Canvas style updated for page:', canvas);

    // }, [pageIndex]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Stack image and canvas together */}
        {/* <Canvas ref={handleImageRect}></Canvas> */}
        <View style={styles.pageWrapper}>
        

          <View style={styles.canvasContainer}>
            {/* <Signature
              ref={sigRef}
              onOK={handleOK}
              onClear={() => console.log('Canvas cleared')}
              descriptionText=""
              clearText="Clear"
              confirmText="Save"
              // autoClear={false}
              webStyle={canvasStyle}


            /> */}
            {return_canvas(pageIndex)}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={goBack} style={styles.button} disabled={pageIndex === 0}>
            <Text style={styles.buttonText}>⬅ Back</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClear} style={styles.button}>
            <Text style={styles.buttonText}>Clear ✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNext} style={styles.button} disabled={pageIndex === pages.length - 1}>
            <Text style={styles.buttonText}>Next ➡</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get('window').width;
const imageAspectRatio = 8.5 / 11; // Portrait page

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageWrapper: {
    width: screenWidth,
    height: screenWidth,
    aspectRatio: imageAspectRatio,
    alignSelf: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: undefined,
    resizeMode: 'contain',
    aspectRatio: imageAspectRatio,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  canvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#FFB703',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
