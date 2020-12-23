/**
 * External dependencies
 */
import { useContextSystem } from '@wp-g2/context';
import { cx } from '@wp-g2/styles';
import { createUnitValue, is, noop } from '@wp-g2/utils';

/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as styles from './font-size-control-styles';
import {
	getInputValue,
	getSelectOptions,
	getSelectValueFromFontSize,
	hasUnit,
	isCustomSelectedItem,
} from './font-size-control-utils';

export function useFontSizeControl( props ) {
	const {
		disableCustomFontSizes,
		fontSizes = [],
		onChange = noop,
		value,
		withSlider = false,
		className,
		...otherProps
	} = useContextSystem( props );

	const hasUnits = hasUnit( value || fontSizes[ 0 ]?.size );

	const options = getSelectOptions( {
		options: fontSizes,
		disableCustomFontSizes,
		value,
	} );

	const handleOnReset = useCallback( () => {
		onChange( undefined );
	}, [ onChange ] );

	const handleOnChange = useCallback(
		( { selectedItem } ) => {
			if ( isCustomSelectedItem( selectedItem ) ) return;

			if ( hasUnits ) {
				onChange( selectedItem.size );
			} else if ( is.defined( selectedItem.size ) ) {
				onChange( Number( selectedItem.size ) );
			} else {
				handleOnReset();
			}
		},
		[ handleOnReset, hasUnits, onChange ]
	);

	const handleOnInputChange = useCallback(
		( next ) => {
			if ( ! next && next !== 0 ) {
				handleOnReset();
				return;
			}
			if ( hasUnits ) {
				onChange( createUnitValue( next, 'px' ) );
			} else {
				onChange( Number( next ) );
			}
		},
		[ handleOnReset, hasUnits, onChange ]
	);

	const inputValue = getInputValue( fontSizes, value );

	const selectedFontSizeSlug = getSelectValueFromFontSize( fontSizes, value );
	const currentValue = options.find(
		( option ) => option.key === selectedFontSizeSlug
	);

	const isDefaultValue = ! is.defined( value, className );

	const classes = cx( styles.FontSizeControl );

	const withSelect = fontSizes.length > 0;
	const withNumberInput = ! withSlider && ! disableCustomFontSizes;

	return {
		...otherProps,
		className: classes,
		inputValue,
		isDefaultValue,
		onChange: handleOnChange,
		onInputChange: handleOnInputChange,
		onReset: handleOnReset,
		options,
		value: currentValue,
		withNumberInput,
		withSelect,
		withSlider,
	};
}
