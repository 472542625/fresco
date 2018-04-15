import React from 'react';
import PropTypes from 'prop-types';

import MapboxGl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import Mstyle from '../../model/Mstyle';
import Mlayer from '../../model/Mlayer';

import LayerIcon from '../../utility/LayerIcon';

import 'mapbox-gl-inspect/dist/mapbox-gl-inspect.css';
var MapboxInspect = require('mapbox-gl-inspect');

export default class Vmap extends React.Component {

	static propTypes = {
		styleJS: PropTypes.object.isRequired
	}

	constructor(props) {
		super(props);
		this.state = {
			map:undefined,
			styleJS:undefined
		};
	}

	render (){
		return <div id="map" className="" ref={el => this.container = el}></div>
	}
	componentWillReceiveProps(nextProps) {
		if(!this.state.map) return;

		const {styleJS} = nextProps;

		//console.log('compare:',this.state.styleJS,styleJS);

		if (this.state.styleJS.equals(styleJS)) return;
		this.setState({styleJS:styleJS});

		//console.log('styleJs:',JSON.stringify(styleJS.toJS()));

		/*
		const metadata = nextProps.mapStyle.metadata || {}
		MapboxGl.accessToken = metadata['maputnik:mapbox_access_token'] || tokens.mapbox
		*/

		// clear prev errors
		Mstyle.errorsSet();

		this.state.map.setStyle(styleJS.toJS(),{diff: true});
	}

	renderPopup (features){
		//console.log('features:',features);
		let html = '<ul class="mb-0 map-inspect-list">';
		let layers = {};
		features.forEach((feature)=>{
			layers[feature.layer.id] = layers[feature.layer.id] || {count:0};
			layers[feature.layer.id].count++;
		});
		for (let i in layers){
			const layer = Mlayer.get(i);
			const path = '#/style/'+Mstyle.get().getIn(['rec','id'])+'/layer/'+layer.get('id');
			html += '<li><a href="'+path+'">'+
				'<div class="list-left mr-2 inline-block position-relative">'+
				'<i class="material-icons md-18" style="color:'+
				LayerIcon.getColor(layer)+'">'+LayerIcon.getIcon(layer)+
				'</i></div>'+
				i+' <span class="badge">'+layers[i].count+'</span></a></li>';
		}
		return html;
	}

	componentDidMount() {
		const {styleJS} = this.props;

		this.setState({styleJS:styleJS});

		console.log('map style:',styleJS,MapboxGl);

		const map = new MapboxGl.Map({
			container: this.container,
			style: styleJS.toJS(),
			hash: false
		});

		map.addControl(new MapboxInspect({
			popup: new MapboxGl.Popup({
				closeButton: false,
   			closeOnClick: false
			}),
			showInspectButton: false,
			showMapPopup: true,
			showMapPopupOnHover: false,
			showInspectMapPopupOnHover: false,
			renderPopup: this.renderPopup
		}));


		//console.log('map:',MapboxGl);

		/*
		const zoom = new ZoomControl;
		map.addControl(zoom, 'top-right');
		*/

		const nav = new MapboxGl.NavigationControl();
		map.addControl(nav, 'top-right');

		map.on('error',(e)=>{
			//console.log('map error:',e.error.message);
			console.log('map error:',e);
			if (e.source) return Mstyle.errorAdd({message:'error loading source: '+e.source.url});
			Mstyle.errorAdd(e.error);
		});

		this.setState({map:map});



		//this.setState({map:map});



		/*
		const map = new MapboxGl.Map({
		container: this.container,
		style: this.props.mapStyle,
		hash: true,
		})

		*/

		/*

		const inspect = new MapboxInspect({
		popup: new MapboxGl.Popup({
		  closeOnClick: false
		}),
		showMapPopup: true,
		showMapPopupOnHover: false,
		showInspectMapPopupOnHover: true,
		showInspectButton: false,
		assignLayerColor: (layerId, alpha) => {
		  return Color(colors.brightColor(layerId, alpha)).desaturate(0.5).string()
		},
		buildInspectStyle: (originalMapStyle, coloredLayers) => buildInspectStyle(originalMapStyle, coloredLayers, this.props.highlightedLayer),
		renderPopup: features => {
		  if(this.props.inspectModeEnabled) {
		    return renderPropertyPopup(features)
		  } else {
		    var mountNode = document.createElement('div');
		    ReactDOM.render(<FeatureLayerPopup features={features} onLayerSelect={this.props.onLayerSelect} />, mountNode)
		    return mountNode
		  }
		}
		})
		map.addControl(inspect)

		map.on("style.load", () => {
		this.setState({ map, inspect });
		})

		map.on("data", e => {
		if(e.dataType !== 'tile') return
		this.props.onDataChange({
		  map: this.state.map
		})
		})
		*/
  }
};