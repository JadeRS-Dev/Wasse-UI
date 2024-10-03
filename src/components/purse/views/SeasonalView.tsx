import { FC } from 'react';
import { LocalizeFormattedNumber } from '../../../api';
import { Flex, LayoutCurrencyIcon, Text } from '../../../common';

interface SeasonalViewProps
{
    type: number;
    amount: number;
}

export const SeasonalView: FC<SeasonalViewProps> = props =>
{
    const { type = -1, amount = -1 } = props;

    return (
        <Flex justifyContent="between" className="" style={ { position: 'relative', width: '60px', marginLeft: '124px', background: 'rgb(16, 16, 16)',padding: '8px', borderRadius: '6px', marginTop: '1px', WebkitBoxShadow: 'rgba(255, 255, 255, 0.75) 1px 3px 12px -6px', } }>
            <Flex gap={ 1 }>
                <LayoutCurrencyIcon 
                    style={ { marginLeft: '0px', marginTop: '1px', background: 'url("https://habbolatam.com/assetsak/images/wallet/103.png")', } }
                    type={ type } />
                <Text
                    truncate
                    variant="white"
                    grow
                    style={ { fontSize: '16px', fontWeight: 'bold', marginTop: '-5px', marginLeft: '17px', width: '30px', overflow: 'hidden', position: 'absolute', } }
                >
                    { LocalizeFormattedNumber(amount) }
                </Text>
            </Flex>
        </Flex>
    );
}
