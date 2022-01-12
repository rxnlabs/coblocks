/**
 * External dependencies.
 */
 import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { className, externalCalendarUrl } = attributes;

	const classes = classnames( className, 'wp-block-coblocks-front-events-swiper-container' );

	return ! externalCalendarUrl && (
		<div className={ classes }>
			<div className="swiper-wrapper">
				<InnerBlocks.Content />
			</div>
			<button className={ `wp-coblocks-events-nav-button__prev` } id={ `wp-coblocks-event-swiper-prev` } />
			<button className={ `wp-coblocks-events-nav-button__next` } id={ `wp-coblocks-event-swiper-next` } />
		</div>
	);
}
