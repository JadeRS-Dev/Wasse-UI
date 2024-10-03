import { FC, useMemo } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LocalizeFormattedNumber, LocalizeShortNumber } from '../../../api';
import { Flex, LayoutCurrencyIcon, Text } from '../../../common';

interface CurrencyViewProps
{
    type: number;
    amount: number;
    short: boolean;
}

export const CurrencyView: FC<CurrencyViewProps> = props =>
{
    const { type = -1, amount = -1, short = false } = props;
    
    const element = useMemo(() =>
    {
        return (
            <Flex justifyContent="end" pointer gap={ 1 } className={ `nitro-purse-button rounded allcurrencypurse nitro-purse-button currency-${ type }` }>
                <LayoutCurrencyIcon type={ type } />
                <Text
                    truncate
                    variant="white"
                    grow
                    style={ { fontSize: '16px', fontWeight: 'bold', marginTop: '-4px' } }
                >
                    { short ? LocalizeShortNumber(amount) : LocalizeFormattedNumber(amount) }
                </Text>
            </Flex>


        );
    }, [ amount, short, type ]);

    if(!short) return element;
    
    return (
        <OverlayTrigger
            placement="left"
            overlay={
                <Tooltip id={ `tooltip-${ type }` }>
                    { LocalizeFormattedNumber(amount) }
                </Tooltip>
            }>
            { element }
        </OverlayTrigger>
    );
}
