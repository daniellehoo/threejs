// Library
import React from 'react';
import THREE from 'three';
import buildThreeEffectComposer from 'three-effectcomposer';

const ThreeEffectComposer = buildThreeEffectComposer(THREE);

import Base from '../base.jsx';

// effects pass
import RenderPass from './renderPass.jsx';
import FXAAPass from './FXAAPass.jsx';
import SMAAPass from './SMAAPass.jsx';
import SSAOPass from './SSAOPass.jsx';

export default class EffectComposer extends Base {
	constructor() {
		super();

		this.handleRenderEffect = this.handleRenderEffect.bind(this);
	}

	getThreeType() {
		return 'EffectComposer';
	}

	componentWillMount() {
		const oComposer = new ThreeEffectComposer();
		this.oComposer = oComposer;
		this.oComposer.setSize(this.props.width, this.props.height);

		this.oEffect = {
			setRenderer(oRenderer) {
				oComposer.renderer = oRenderer;
			},
			render: this.handleRenderEffect
		};
	}

	handleRenderEffect(oScene, oCamera, oRenderer) {
		// first, do all preparation
		this.aPreparePass.forEach(fPreparePass => fPreparePass(oScene, oCamera, oRenderer));

		// render
		this.oComposer.render();
	}

	componentDidMount() {
		this._parseChild();
	}

	componentDidUpdate() {
		this._parseChild();
	}

	componentWillReceiveProps(nextProps) {
		this.oComposer.setSize(nextProps.width, nextProps.height);
	}

	_parseChild() {
		const aPreparePass = [];
		// reset composer pass
		this.oComposer.passes = [];
		this.aChildren.forEach((oChild, iIndex) => {
			const oPass = oChild.getThreeObject();
			if (oPass.prepare !== undefined) {
				aPreparePass.push(oPass.prepare);
			}
			// add pass to composer
			if (iIndex === this.aChildren.length - 1) {
				// last pass
				oPass.pass.renderToScreen = true;
			}
			this.oComposer.addPass(oPass.pass);
		});

		this.aPreparePass = aPreparePass;
	}

	getThreeObject() {
		return this.oEffect;
	}
}

EffectComposer.displayName = 'EffectComposer';

EffectComposer.propTypes = {
	width: React.PropTypes.number,
	height: React.PropTypes.number
};

EffectComposer.defaultProps = {
	width: 200,
	height: 200
};

EffectComposer.RenderPass = RenderPass;
EffectComposer.FXAAPass = FXAAPass;
EffectComposer.SMAAPass = SMAAPass;
EffectComposer.SSAOPass = SSAOPass;
