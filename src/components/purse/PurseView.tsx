import { FriendlyTime, HabboClubLevelEnum } from '@nitrots/nitro-renderer';
import { FC, useMemo, useState } from 'react';
import { CreateLinkEvent, GetConfiguration, LocalizeText } from '../../api';
import { Column, Flex, Grid, LayoutCurrencyIcon } from '../../common';
import { usePurse } from '../../hooks';
import { CurrencyView } from './views/CurrencyView';
import { SeasonalView } from './views/SeasonalView';

export const PurseView: FC<{}> = props =>
{
    const { purse = null, hcDisabled = false } = usePurse();

    const displayedCurrencies = useMemo(() => GetConfiguration<number[]>('system.currency.types', []), []);
    const currencyDisplayNumberShort = useMemo(() => GetConfiguration<boolean>('currency.display.number.short', false), []);
    const [ isHovered, setIsHovered ] = useState(false);
    const [ toolHovered, setToolHovered ] = useState({
        hc: false,
        ayuda: false,
        config: false,
    });
    
    const handleMouseOver = (tool) => 
    {
        setToolHovered((prev) => ({ ...prev, [tool]: true }));
    };
      
    const handleMouseOut = (tool) => 
    {
        setToolHovered((prev) => ({ ...prev, [tool]: false }));
    };

    const getClubText = (() =>
    {
        if(!purse) return null;

        const totalDays = ((purse.clubPeriods * 31) + purse.clubDays);
        const minutesUntilExpiration = purse.minutesUntilExpiration;

        if(purse.clubLevel === HabboClubLevelEnum.NO_CLUB) return LocalizeText('purse.clubdays.zero.amount.text');

        else if((minutesUntilExpiration > -1) && (minutesUntilExpiration < (60 * 24))) return FriendlyTime.shortFormat(minutesUntilExpiration * 60);
        
        else return FriendlyTime.shortFormat(totalDays * 86400);
    })();

    const getCurrencyElements = (offset: number, limit: number = -1, seasonal: boolean = false) =>
    {
        if(!purse || !purse.activityPoints || !purse.activityPoints.size) return null;

        const types = Array.from(purse.activityPoints.keys()).filter(type => (displayedCurrencies.indexOf(type) >= 0));

        let count = 0;

        while(count < offset)
        {
            types.shift();

            count++;
        }

        count = 0;

        const elements: JSX.Element[] = [];

        for(const type of types)
        {
            if((limit > -1) && (count === limit)) break;

            if(seasonal) elements.push(<SeasonalView key={ type } type={ type } amount={ purse.activityPoints.get(type) } />);
            else elements.push(<CurrencyView key={ type } type={ type } amount={ purse.activityPoints.get(type) } short={ currencyDisplayNumberShort } />);

            count++;
        }

        return elements;
    }

    if(!purse) return null;

    return (
        <Column alignItems="end" className="nitro-purse-container" gap={ 3 }>
            <div className="nitro-purse d-flex align-items-center"> { /* Añadido d-flex y align-items-center */ }
                <Grid fullWidth gap={ 1 } className="flex-grow-1" style={ { marginLeft: '30px', marginTop: '15px', } }>
                    <Column justifyContent="center" size={ hcDisabled ? 10 : 6 } gap={ 0 }>
                        <CurrencyView type={ -1 } amount={ purse.credits } short={ currencyDisplayNumberShort } />
                        { getCurrencyElements(0, 1) }
                        { getCurrencyElements(2, -1, true) }
                    </Column>
                    { !hcDisabled && (
                        <Column
                            center
                            size={ 4 }
                            gap={ 1 }
                        >
                            <Flex>
                                <LayoutCurrencyIcon type="hc" 
                                    onClick={ (event) => CreateLinkEvent('habboUI/open/hccenter') }
                                    onMouseEnter={ () => handleMouseOver('hc') }
                                    onMouseLeave={ () => handleMouseOut('hc') }
                                    style={ { cursor: 'pointer', border: '1px solid #c8c8c8', marginLeft: '-12px', marginTop: '-15px', position: 'absolute', backgroundColor: '#dda31b', padding: '12px', borderRadius: '5px', width: '31px' } } />
                                <span
                                    className={ `span-textgen ${ toolHovered.hc ? 'visible' : 'hidden' }` }
                                >
                               HC Infinito
                                </span>
                            </Flex>
                        </Column>
                   
                    ) }
                    <Column justifyContent="center" size={ 2 } gap={ 0 }>
                        <Flex
                            center
                            pointer
                            fullHeight
                            className="nitro-purse-button p-1"
                            style={ { background: 'url("https://habbolatam.com/wasseyemma/ayuda_1.png") no-repeat', backgroundColor: '#3330', marginLeft: '-27px', cursor: 'pointer', marginTop: '26px', width: '40px', height: '30px !important', } } 
                            onMouseEnter={ () => handleMouseOver('ayuda') }
                            onMouseLeave={ () => handleMouseOut('ayuda') }
                            onClick={ (event) => CreateLinkEvent('help/show') }
                        >
                            <span className={ `span-textgen ${ toolHovered.ayuda ? 'visible' : 'hidden' }` }>
                            Ayuda
                            </span>
                        </Flex>
                        <Flex
                            center
                            pointer
                            fullHeight
                            className="p-1"
                            onMouseEnter={ () => handleMouseOver('config') }
                            onMouseLeave={ () => handleMouseOut('config') }
                            style={ { background: 'url("https://habbolatam.com/wasseyemma/configuracion_1.png") no-repeat', backgroundColor: '#3330', marginLeft: '11px', cursor: 'pointer', marginTop: '9px', width: '32px', backgroundSize: 'contain', } } 
                            onClick={ (event) => CreateLinkEvent('user-settings/toggle') }
                        >
                            <span style={ { marginTop: '40px' } } className={ `span-textgen ${ toolHovered.config ? 'visible' : 'hidden' }` }>
                            Configuración
                            </span>
                        </Flex>
                    </Column>
                </Grid>
            </div>
        </Column>


    );
}
