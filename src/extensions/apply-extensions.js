import {
	useAdvancedControls as advancedControls,
	applyAttributes as advancedControlsApplyAttributes,
	useEditorProps as advancedControlsEditorProps,
	applySaveProps as advancedControlsSaveProps,
} from './advanced-controls';
import {
	applyAttributes as animationApplyAttributes,
	useAnimationControls as animationControls,
	useEditorProps as animationEditorProps,
	applySaveProps as animationSaveProps,
} from './animation';

/**
 * WordPress Dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { withSelect } from '@wordpress/data';
import { compose, createHigherOrderComponent } from '@wordpress/compose';

/**
 * Utilities
 */
const enhance = compose(
	/**
	 * For blocks whose block type doesn't support `multiple`, provides the
	 * wrapped component with `originalBlockClientId` -- a reference to the
	 * first block of the same type in the content -- if and only if that
	 * "original" block is not the current one. Thus, an inexisting
	 * `originalBlockClientId` prop signals that the block is valid.
	 *
	 * @param {Function} WrappedBlockEdit A filtered BlockEdit instance.
	 * @return {Function} Enhanced component with merged state data props.
	 */
	withSelect( ( select ) => {
		return {
			select,
			selected: select( 'core/block-editor' ).getSelectedBlock(),
		};
	} ),
);

/**
 * React hook function to override the default block element to add wrapper props.
 *
 * @function addEditorBlockAttributes
 * @param {Object} BlockListBlock Block and its wrapper in the editor.
 * @return {Object} BlockListBlock extended
 */
const addAllEditorProps = createHigherOrderComponent( ( BlockListBlock ) => {
	return enhance( ( { select, ...props } ) => {
		const block = select( 'core/block-editor' ).getBlock( props.rootClientId || props.clientId );
		const blockName = select( 'core/block-editor' ).getBlockName( props.rootClientId || props.clientId );

		const wrapperProps = {
			...advancedControlsEditorProps( block, blockName, props, props.wrapperProps ),
			...animationEditorProps( block, blockName, props, props.wrapperProps ),
		};

		// Extra features are JSX conditionals and should be rendered outside of the
		// wrapper thus should be stripped from `wrapperProps` applied to the DOM.
		const extraFeatures = wrapperProps.extraFeatures || {};
		delete wrapperProps.extraFeatures;

		const renderFeature = ( featureObject ) => {
			const key = featureObject?.[ 0 ];
			const feature = featureObject?.[ 1 ];

			if ( ! key || ! feature ) {
				return null;
			}

			const { conditional, jsx } = feature;
			return conditional && jsx;
		};

		const featureMap = Object.entries( extraFeatures ).map( ( feature ) => renderFeature( feature ) );

		return (
			<>
				<BlockListBlock { ...props } wrapperProps={ wrapperProps } />
				{ featureMap.map( ( feature, index ) => {
					return <span key={ index }>{ feature }</span> || null;
				} ) }
			</>
		);
	} );
}, 'addEditorBlockAttributes' );

/**
 * Filters registered block settings, extending attributes with settings
 *
 * @param {Object} settings Original block settings.
 * @return {Object} Filtered block settings.
 */
function applyAllAttributes( settings ) {
	const extendedSettings = {
		...advancedControlsApplyAttributes( settings ),
		...animationApplyAttributes( settings ),
	};

	return extendedSettings;
}

/**
 * Override props assigned to save component to inject attributes
 *
 * @param {Object} extraProps Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Current block attributes.
 * @return {Object} Filtered props applied to save element.
 */
function applyAllSaveProps( extraProps, blockType, attributes ) {
	const extendedExtraProps = {
		...animationSaveProps( extraProps, blockType, attributes ),
		...advancedControlsSaveProps( extraProps, blockType, attributes ),
	};

	return extendedExtraProps;
}

/**
 * Add custom CoBlocks controls to selected blocks
 *
 * @param {Function} BlockEdit Original component.
 * @return {string} Wrapped component.
 */
const applyAllControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		return (
			<>
				<BlockEdit { ...props } />
				{ advancedControls( props ) }
				{ animationControls( props ) }
			</>
		);
	};
}, 'applyAllControls' );

/**
 * Filters
 */
addFilter(
	'editor.BlockListBlock',
	'coblocks/applyEditorProps',
	addAllEditorProps
);
addFilter(
	'blocks.registerBlockType',
	'coblocks/AdvancedControls/attributes',
	applyAllAttributes
);
addFilter(
	'blocks.getSaveContent.extraProps',
	'coblocks/applySaveProps',
	applyAllSaveProps
);
addFilter(
	'editor.BlockEdit',
	'coblocks/advanced',
	applyAllControls,
);