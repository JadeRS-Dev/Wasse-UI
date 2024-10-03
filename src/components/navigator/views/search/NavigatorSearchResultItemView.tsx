import { RoomDataParser } from '@nitrots/nitro-renderer';
import { FC, MouseEvent } from 'react';
import { FaUser } from 'react-icons/fa';
import { CreateRoomSession, DoorStateType, GetSessionDataManager, TryVisitRoom } from '../../../../api';
import { Flex, LayoutBadgeImageView, LayoutGridItemProps, LayoutRoomThumbnailView, Text } from '../../../../common';
import { useNavigator } from '../../../../hooks';
import { NavigatorSearchResultItemInfoView } from './NavigatorSearchResultItemInfoView';
export interface NavigatorSearchResultItemViewProps extends LayoutGridItemProps
{
    roomData: RoomDataParser
    thumbnail?: boolean
}

export const NavigatorSearchResultItemView: FC<NavigatorSearchResultItemViewProps> = props =>
{
    const { roomData = null, children = null, thumbnail = false, ...rest } = props;
    const { setDoorData = null } = useNavigator();
    const regexProhibidas = /\b(?:com|org|net|us|es|\W)+\b/gi;
    const descripcionFiltrada = regexProhibidas.test(roomData.description) ? 'Spam' : roomData.description;
    const getUserCounterColor = () =>
    {
        const num: number = (100 * (roomData.userCount / roomData.maxUserCount));

        let bg = 'bg-primary';

        if(num >= 92)
        {
            bg = 'bg-danger';
        }
        else if(num >= 50)
        {
            bg = 'bg-warning';
        }
        else if(num > 0)
        {
            bg = 'bg-success';
        }

        return bg;
    }

    const visitRoom = (event: MouseEvent) =>
    {
        if(roomData.ownerId !== GetSessionDataManager().userId)
        {
            if(roomData.habboGroupId !== 0)
            {
                TryVisitRoom(roomData.roomId);

                return;
            }

            switch(roomData.doorMode)
            {
                case RoomDataParser.DOORBELL_STATE:
                    setDoorData(prevValue =>
                    {
                        const newValue = { ...prevValue };
        
                        newValue.roomInfo = roomData;
                        newValue.state = DoorStateType.START_DOORBELL;
        
                        return newValue;
                    });
                    return;
                case RoomDataParser.PASSWORD_STATE:
                    setDoorData(prevValue =>
                    {
                        const newValue = { ...prevValue };
        
                        newValue.roomInfo = roomData;
                        newValue.state = DoorStateType.START_PASSWORD;
        
                        return newValue;
                    });
                    return;
            }
        }
        
        CreateRoomSession(roomData.roomId);
    }

    if(thumbnail) return (
        <Flex pointer overflow="hidden" alignItems="center" onClick={ visitRoom } gap={ 1 } className="navigator-item p-1 rounded-3 small mb-1 d-flex border border-muted">
            <LayoutRoomThumbnailView roomId={ roomData.roomId } customUrl={ roomData.officialRoomPicRef } className="d-flex flex-column align-items-center justify-content-end mb-1" style={ { width: '64px', height: '64px' } }>
                { roomData.habboGroupId > 0 && <LayoutBadgeImageView badgeCode={ roomData.groupBadgeCode } isGroup={ true } className={ 'position-absolute top-0 start-0 m-1' } /> }
                <Flex center className={ 'badge p-1 position-absolute m-1 ' + getUserCounterColor() } gap={ 1 } style={ { width: '100%', borderRadius: '0px', fontSize: '10px', marginTop: '15px', top: '68%', } }>
                    <FaUser className="fa-icon" />
                    { roomData.userCount }
                </Flex>
                { (roomData.doorMode !== RoomDataParser.OPEN_STATE) && 
                <i className={ ('position-absolute end-0 mb-1 me-1 icon icon-navigator-room-' + ((roomData.doorMode === RoomDataParser.DOORBELL_STATE) ? 'locked' : (roomData.doorMode === RoomDataParser.PASSWORD_STATE) ? 'password' : (roomData.doorMode === RoomDataParser.INVISIBLE_STATE) ? 'invisible' : '')) } style={ { top: '0px' } }/> }
            </LayoutRoomThumbnailView>
            <Flex style={ { width: '170px' } }>
                <Text truncate className="flex-grow-1" style={ { overflow: 'hidden', color: '#1c1c1c',
                    marginLeft: '0px',
                    marginTop: '-1px',
                    fontWeight: '700',
                    fontSize: '12px', } }>{ roomData.roomName } <br /><br />
                    <div>
                        <b> Descripción: { roomData.description ? descripcionFiltrada : 'Sin descripción' }</b>
                    </div>
                    <div><b>Dueño: { roomData.ownerName ? roomData.ownerName : 'Dueño oficial' }</b></div></Text>
                <Flex reverse alignItems="center" gap={ 1 }>
                    <NavigatorSearchResultItemInfoView roomData={ roomData } />
                </Flex>
                { children } 
            </Flex>

        </Flex>
    );

    return (
        <Flex pointer overflow="hidden" alignItems="center" onClick={ visitRoom } gap={ 1 } className="navigator-item p-1 rounded-3 small mb-1 d-flex border border-muted" style={ { } }>
            <LayoutRoomThumbnailView roomId={ roomData.roomId } customUrl={ roomData.officialRoomPicRef } className="d-flex flex-column align-items-center justify-content-end mb-1" style={ { width: '64px', height: '64px' } }>
                { roomData.habboGroupId > 0 && <LayoutBadgeImageView badgeCode={ roomData.groupBadgeCode } isGroup={ true } className={ 'position-absolute top-0 start-0 m-1' } /> }
                <Flex center className={ 'badge p-1 position-absolute m-1 ' + getUserCounterColor() } gap={ 1 } style={ { width: '100%', borderRadius: '0px', fontSize: '10px', marginTop: '15px', top: '68%', } }>
                    <FaUser className="fa-icon" />
                    { roomData.userCount }
                </Flex>
                { (roomData.doorMode !== RoomDataParser.OPEN_STATE) && 
            <i className={ ('position-absolute end-0 mb-1 me-1 icon icon-navigator-room-' + ((roomData.doorMode === RoomDataParser.DOORBELL_STATE) ? 'locked' : (roomData.doorMode === RoomDataParser.PASSWORD_STATE) ? 'password' : (roomData.doorMode === RoomDataParser.INVISIBLE_STATE) ? 'invisible' : '')) } style={ { top: '0px', } } /> }
            </LayoutRoomThumbnailView>
            <Flex className="w-100">
                <Text truncate className="flex-grow-1" style={ { overflow: 'hidden', color: '#1c1c1c',
                    marginLeft: '0px',
                    marginTop: '-1px',
                    fontWeight: '700',
                    fontSize: '12px', } }>{ roomData.roomName } <br /><br /><br />
                    <div>
                        <b> Descripción: { roomData.description ? descripcionFiltrada : 'Sin descripción' }</b>
                    </div>
                    <div><b>{ roomData.ownerName ? roomData.ownerName : 'Dueño oficial' } </b></div>
                </Text>
                <Flex reverse alignItems="center" gap={ 1 }>
                    <NavigatorSearchResultItemInfoView roomData={ roomData } />
                </Flex>
                { children } 
            </Flex>

        </Flex>
    );
}
