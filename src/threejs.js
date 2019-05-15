import React, { Component } from 'react';
import {withGlobalState} from 'react-globally';

import * as THREE from 'three';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';

import {HorizontalTiltShiftShader} from '../lib/shaders/HorizontalTiltShiftShader';
import {VerticalTiltShiftShader} from '../lib/shaders/VerticalTiltShiftShader';
import {SSAOPass} from '../lib/postprocessing/SSAOPass';

import model from '../model/maneki-neko/luckycat.glb';

class Model extends Component {
  constructor(props) {
    super(props)

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)
  }

  componentDidMount(){
      const width = this.mount.clientWidth
      const height = this.mount.clientHeight

      //ADD SCENE
      this.scene = new THREE.Scene()

      //ADD CAMERA
      this.camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.0001,
        10000
      )
      this.camera.position.z = 4

      //ADD RENDERER
      this.renderer = new THREE.WebGLRenderer({
        logarithmicDepthBuffer: true,
        context: null,
        precision: "highhp",
        premultipliedAlpha: true,
        antialias: true,
        powerPreference: "high-performance"
    })
        this.renderer.setClearColor('#286528')
        this.renderer.setSize(width, height)
        this.mount.appendChild(this.renderer.domElement)

        // ADD CONTROLS
          this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // this.camera.position.set(
        //     this.currentItem.camera_position.x,
        //     this.currentItem.camera_position.y,
        //     this.currentItem.camera_position.z)
        // this.controls.target.set(
        //     this.currentItem.controls_target.x,
        //     this.currentItem.controls_target.y,
        //     this.currentItem.controls_target.z)

        this.controls.update()

        // ADD LIGHT
        this.amb_light = new THREE.AmbientLight(0x404040, 8); // soft white light
        this.scene.add(this.amb_light);

        // ADD RAYCASTER
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

  //ADD CUBE
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: '#433F81', wireframe:true    })
  this.cube = new THREE.Mesh(geometry, material)
  this.scene.add(this.cube)

  let this_ = this;

  //ADD MODEL
  const loader = new GLTFLoader();


  let pointer_to_this = this;

  // load a resource
  loader.load(
    // resource URL
    model,

    // called when resource is loaded
    function ( object ) {


      this_.model = object.scenes[0];
      this_.scene.add(this_.model);

      let model_bbox1 = new THREE.Box3().setFromObject(this_.model);
      let length_x = model_bbox1.max.x +.235;
      let length_y = model_bbox1.max.y;
      let target_length = .91

      this_.model.scale.set(target_length / length_x, target_length / length_y, target_length / length_y)
      // this_.model.rotation.x = Math.PI / 2;
      // this_.model.rotation.y = Math.PI;
      // this_.model.rotation.z = Math.PI / 2;

      let model_bbox2 = new THREE.Box3().setFromObject(this_.model);
      this_.model.position.x = 0;
      this_.model.position.y = 0;
      this_.model.position.z = 0;
      this_.model_bbox = new THREE.Box3().setFromObject(this_.model)

      console.log(this.model.material)
      this_.model.material.transparent = true;
      // this_.model.material.color.setHex(0x00FF00);
      this_.model.material.opacity = 1;

    },
    // called when loading is in progresses
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
    }
  );

  /////////////////////// AMBIENT OCCLUSION  /////////////////////////
// addAmbientOcclusion(){
  this.ssaoPass = new THREE.SSAOPass( scene, camera, width, height );
  this.ssaoPass.kernelRadius = 16;
  let effect = new THREE.EffectComposer( renderer );
  effect.addPass( ssaoPass );
  // Init gui
  let gui = new dat.GUI();
  gui.add( ssaoPass, 'output', {
    'Default': THREE.SSAOPass.OUTPUT.Default,
    'SSAO Only': THREE.SSAOPass.OUTPUT.SSAO,
    'SSAO Only + Blur': THREE.SSAOPass.OUTPUT.Blur,
    'Beauty': THREE.SSAOPass.OUTPUT.Beauty,
    'Depth': THREE.SSAOPass.OUTPUT.Depth,
    'Normal': THREE.SSAOPass.OUTPUT.Normal
  } ).onChange( function ( value ) {
    ssaoPass.output = parseInt( value );
  } );
  gui.add( ssaoPass, 'kernelRadius' ).min( 0 ).max( 32 );
  gui.add( ssaoPass, 'minDistance' ).min( 0.001 ).max( 0.02 );
  gui.add( ssaoPass, 'maxDistance' ).min( 0.01 ).max( 0.3 );
// }


this.start()
}


  componentWillUnmount() {
    window.removeEventListener('resize', this.on_window_resize);
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  on_window_resize = () => {
  this.width = this.mount.getClientRects()[0].width
  this.height = this.mount.getClientRects()[0].height
  this.camera.aspect = this.width/ this.height;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(this.width, this.height);
}

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId)
  }

  animate() {
    // this.cube.rotation.x += 0.02
    // this.cube.rotation.y += 0.02

    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    return (
      <div
        style={{ width: '100vw', height: '100vh' }}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default Model
