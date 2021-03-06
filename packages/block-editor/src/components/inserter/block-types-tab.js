/**
 * External dependencies
 */
import { map, findIndex, flow, sortBy, groupBy, orderBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { store as blocksStore } from '@wordpress/blocks';
import { useMemo, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockTypesList from '../block-types-list';
import ChildBlocks from './child-blocks';
import InserterPanel from './panel';
import useBlockTypesState from './hooks/use-block-types-state';

const getBlockNamespace = ( item ) => item.name.split( '/' )[ 0 ];

const MAX_SUGGESTED_ITEMS = 6;

export function BlockTypesTab( {
	rootClientId,
	onInsert,
	onHover,
	showMostUsedBlocks,
} ) {
	const [ items, categories, collections, onSelectItem ] = useBlockTypesState(
		rootClientId,
		onInsert
	);

	const hasChildItems = useSelect(
		( select ) => {
			const { getBlockName } = select( 'core/block-editor' );
			const { getChildBlockNames } = select( blocksStore );
			const rootBlockName = getBlockName( rootClientId );

			return !! getChildBlockNames( rootBlockName ).length;
		},
		[ rootClientId ]
	);

	const suggestedItems = useMemo( () => {
		return orderBy( items, [ 'frecency' ], [ 'desc' ] ).slice(
			0,
			MAX_SUGGESTED_ITEMS
		);
	}, [ items ] );

	const uncategorizedItems = useMemo( () => {
		return items.filter( ( item ) => ! item.category );
	}, [ items ] );

	const itemsPerCategory = useMemo( () => {
		const getCategoryIndex = ( item ) => {
			return findIndex(
				categories,
				( category ) => category.slug === item.category
			);
		};

		return flow(
			( itemList ) =>
				itemList.filter(
					( item ) => item.category && item.category !== 'reusable'
				),
			( itemList ) => sortBy( itemList, getCategoryIndex ),
			( itemList ) => groupBy( itemList, 'category' )
		)( items );
	}, [ items, categories ] );

	const itemsPerCollection = useMemo( () => {
		// Create a new Object to avoid mutating collection.
		const result = { ...collections };
		Object.keys( collections ).forEach( ( namespace ) => {
			result[ namespace ] = items.filter(
				( item ) => getBlockNamespace( item ) === namespace
			);
			if ( result[ namespace ].length === 0 ) {
				delete result[ namespace ];
			}
		} );

		return result;
	}, [ items, collections ] );

	// Hide block preview on unmount.
	useEffect( () => () => onHover( null ), [] );

	return (
		<div>
			{ hasChildItems && (
				<ChildBlocks rootClientId={ rootClientId }>
					<BlockTypesList
						// Pass along every block, as useBlockTypesState() and
						// getInserterItems() will have already filtered out
						// non-child blocks.
						items={ items }
						onSelect={ onSelectItem }
						onHover={ onHover }
						label={ __( 'Child Blocks' ) }
					/>
				</ChildBlocks>
			) }

			{ showMostUsedBlocks &&
				! hasChildItems &&
				!! suggestedItems.length && (
					<InserterPanel title={ _x( 'Most used', 'blocks' ) }>
						<BlockTypesList
							items={ suggestedItems }
							onSelect={ onSelectItem }
							onHover={ onHover }
							label={ _x( 'Most used', 'blocks' ) }
						/>
					</InserterPanel>
				) }

			{ ! hasChildItems &&
				map( categories, ( category ) => {
					const categoryItems = itemsPerCategory[ category.slug ];
					if ( ! categoryItems || ! categoryItems.length ) {
						return null;
					}
					return (
						<InserterPanel
							key={ category.slug }
							title={ category.title }
							icon={ category.icon }
						>
							<BlockTypesList
								items={ categoryItems }
								onSelect={ onSelectItem }
								onHover={ onHover }
								label={ category.title }
							/>
						</InserterPanel>
					);
				} ) }

			{ ! hasChildItems && !! uncategorizedItems.length && (
				<InserterPanel
					className="block-editor-inserter__uncategorized-blocks-panel"
					title={ __( 'Uncategorized' ) }
				>
					<BlockTypesList
						items={ uncategorizedItems }
						onSelect={ onSelectItem }
						onHover={ onHover }
						label={ __( 'Uncategorized' ) }
					/>
				</InserterPanel>
			) }

			{ ! hasChildItems &&
				map( collections, ( collection, namespace ) => {
					const collectionItems = itemsPerCollection[ namespace ];
					if ( ! collectionItems || ! collectionItems.length ) {
						return null;
					}

					return (
						<InserterPanel
							key={ namespace }
							title={ collection.title }
							icon={ collection.icon }
						>
							<BlockTypesList
								items={ collectionItems }
								onSelect={ onSelectItem }
								onHover={ onHover }
								label={ collection.title }
							/>
						</InserterPanel>
					);
				} ) }
		</div>
	);
}

export default BlockTypesTab;
