// Library
import React, { Component } from 'react';
import * as THREE from 'three';
import buildThreeEffectComposer from 'three-effectcomposer';
import {SSAOShader} from '../shaders/SSAOShader';
import PropTypes from 'prop-types';

const ThreeEffectComposer = buildThreeEffectComposer(THREE);

export default class SSAOPass extends React.Component {
	getThreeType() {
		return 'SSAOPass';
	}

	componentWillMount() {
		// Setup depth pass
		const depthShader = THREE.ShaderLib.depthRGBA;
		const oDepthMaterial = new THREE.ShaderMaterial({
			fragmentShader: depthShader.fragmentShader,
			vertexShader: depthShader.vertexShader,
			uniforms: THREE.UniformsUtils.clone(depthShader.uniforms),
			blending: THREE.NoBlending
		});

		// Setup depth pass
		const oDepthRenderTarget = new THREE.WebGLRenderTarget(this.props.width, this.props.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

		// And another shader, drawing to the screen at this point
		const oEffectSSAO = new ThreeEffectComposer.ShaderPass(SSAOShader);
		oEffectSSAO.uniforms.tDepth.value = oDepthRenderTarget;

		const fPreparePass = function (oScene, oCamera, oRenderer) {
			const oRenderedScene = (this.oScene === undefined) ? oScene : this.oScene;

			// Render depth into depthRenderTarget
			oRenderedScene.overrideMaterial = oDepthMaterial;
			oRenderer.render(oRenderedScene, oCamera, oDepthRenderTarget, true);

			// Render renderPass and SSAO shaderPass
			oRenderedScene.overrideMaterial = undefined;
		}.bind(this);

		this.oPass = {
			pass: oEffectSSAO,
			prepare: fPreparePass,
			renderTarget: oDepthRenderTarget
		};
	}

	componentWillReceiveProps(nextProps) {
		const {pass, renderTarget} = this.oPass;
		pass.uniforms.size.value.set(nextProps.width, nextProps.height);
		renderTarget.setSize(nextProps.width, nextProps.height);
	}

	componentDidMount() {
		if (this.props.scene !== undefined) {
			const {_THREEReference} = this.props;
			this.oScene = _THREEReference.getObjectByName('Scene', this.props.scene);
		}
	}

	getThreeObject() {
		return this.oPass;
	}

	render() {
		return (
			<span />
		);
	}
}

// SSAOPass.propTypes = {
// 	scene: React.PropTypes.string,
// 	width: React.PropTypes.number,
// 	height: React.PropTypes.number
// };

SSAOPass.defaultProps = {
	width: 200,
	height: 200
};
