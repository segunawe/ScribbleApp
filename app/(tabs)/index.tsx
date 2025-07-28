import React, { useRef, useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Signature from 'react-native-signature-canvas';


/**import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
*/


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

/*export default function HomeScreen() {
  const [pageIndex, setPageIndex] = useState(0);

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

  return (
    <View style={styles.container}>
     <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <Image
          source={require('../../assets/Page_1.png')} // or whatever page you want
          style={{ width: '100%', aspectRatio: 8.5 / 11 }}
        />
        
        <Signature
          ref={useRef(null)}
          onOK={(data) => console.log('Drawing saved')}
          onClear={() => console.log('Canvas cleared')}
          descriptionText="Draw here"
          clearText="Clear"
          confirmText="Save"
          webStyle={`
            .m-signature-pad--footer { display: none; }
            body,html { background: transparent; }
          `}
          backgroundColor="transparent"
          autoClear={false}
        />
      </View>
    </SafeAreaView>

      <Image source={pages[pageIndex]} style={styles.image} resizeMode="contain"
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={goBack} style={styles.button} disabled={pageIndex === 0}>
          <Text style={styles.buttonText}>⬅ Back</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goNext} style={styles.button} disabled={pageIndex === pages.length - 1}>
          <Text style={styles.buttonText}>Next ➡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 8.5 / 11, // standard US letter page ratio
    resizeMode: 'contain',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFB703',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});*/


//////////


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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Stack image and canvas together */}
        <View style={styles.pageWrapper}>
          <Image
            source={pages[pageIndex]}
            style={styles.image}
          />

          <View style={styles.canvasContainer}>
            <Signature
              ref={sigRef}
              onOK={handleOK}
              onClear={() => console.log('Canvas cleared')}
              descriptionText=""
              clearText="Clear"
              confirmText="Save"
              autoClear={false}
              backgroundColor="transparent"
              webStyle={canvasStyle}
            />
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
    backgroundColor:'transparent',
    zIndex: 2,
  },
  canvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor:'#fff',
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

const canvasStyle = `
  .m-signature-pad--footer { display: none; }
  .m-signature-pad { box-shadow: none; border: none; background: transparent !important; }
  body,html { background: transparent !important; margin: 0; padding: 0; }
  canvas {
    background-color: transparent !important;
    position: absolute;
    top: 0;
    left: 0;
  }
`;


/*******export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});*****//// 
