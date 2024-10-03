import { GetGuestRoomResultEvent, NavigatorSearchComposer, RateFlatMessageComposer, RoomControllerLevel, RoomDataParser } from '@nitrots/nitro-renderer';
import { FC, useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CreateLinkEvent, GetRoomEngine, LocalizeText, SendMessageComposer, SetLocalStorage, TryVisitRoom } from '../../../../api';
import { Base, Column, Flex, Text, TransitionAnimation, TransitionAnimationTypes, classNames } from '../../../../common';
import { useMessageEvent, useNavigator, useRoom } from '../../../../hooks';

export const RoomToolsWidgetView: FC<{}> = props =>
{
    const [ isZoomedIn, setIsZoomedIn ] = useState<boolean>(false);
    const [ isBubblenew, setIsBubble ] = useState<boolean>(false);
    const [ roomName, setRoomName ] = useState<string>(null);
    const [ roomOwner, setRoomOwner ] = useState<string>(null);
    const [ roomTags, setRoomTags ] = useState<string[]>(null);
    const [ isOpen, setIsOpen ] = useState<boolean>(false);
    const { navigatorData = null } = useNavigator();
    const { roomSession = null } = useRoom();
    const [ roomHistory, setRoomHistory ] = useState<{ roomId: number, roomName: string }[]>([]);
    const [ isOpenHistory, setIsOpenHistory ] = useState<boolean>(false);
    const roomHistoryRef = useRef(null);
    const [ isHovered, setIsHovered ] = useState(false);
    const [ toolHovered, setToolHovered ] = useState({
        bawtool: false,
        settings: false,
        zoom: false,
        chat_history: false,
        hiddenbubbles: false,
        like_room: false,
    });
    
    const handleMouseOver = (tool) => 
    {
        setToolHovered((prev) => ({ ...prev, [tool]: true }));
    };
      
    const handleMouseOut = (tool) => 
    {
        setToolHovered((prev) => ({ ...prev, [tool]: false }));
    };

      
    const handleToolClick = (action: string, value?: string) =>
    {
        switch(action)
        {
            case 'bawtool':
                roomSession.sendChatMessage(':bc', 0);
                break;
            case 'settings':
                CreateLinkEvent('navigator/toggle-room-info');
                return;
            case 'zoom':
                setIsZoomedIn(prevValue =>
                {
                    let scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(roomSession.roomId, 1);

                    if(!prevValue) scale /= 2;
                    else scale *= 2;

                    GetRoomEngine().setRoomInstanceRenderingCanvasScale(roomSession.roomId, 1, scale);

                    return !prevValue;
                });
                return;
            case 'chat_history':
                CreateLinkEvent('chat-history/toggle');
                return;
            case 'hiddenbubbles':
                CreateLinkEvent('nitrobubblehidden/toggle');

                document.getElementById('bubble').classList.toggle('icon-chat-disablebubble');

                return;
            case 'like_room':
                SendMessageComposer(new RateFlatMessageComposer(1));
                return;
            case 'toggle_room_link':
                CreateLinkEvent('navigator/toggle-room-link');
                return;
            case 'navigator_search_tag':
                CreateLinkEvent(`navigator/search/${ value }`);
                SendMessageComposer(new NavigatorSearchComposer('hotel_view', `tag:${ value }`));
                return;
            case 'room_history':
                if (roomHistory.length > 0) 
                {
                    const roomHistoryTool = document.getElementById('roomhistorytool');
                    if (!isOpenHistory) 
                    {
                        roomHistoryTool.style.display = 'block';
                        setIsOpenHistory(true);
                    }
                    else 
                    {
                        setIsOpenHistory(false);
                        roomHistoryTool.style.display = 'none';
                    }
                }
                return;
            case 'room_history_back':
                TryVisitRoom(roomHistory[roomHistory.findIndex(room => room.roomId === navigatorData.currentRoomId) - 1].roomId);
                return;
            case 'room_history_next':
                TryVisitRoom(roomHistory[roomHistory.findIndex(room => room.roomId === navigatorData.currentRoomId) + 1].roomId);
                return;
        }
    }

    const onChangeRoomHistory = (roomId: number, roomName: string) =>
    {
        let newStorage = JSON.parse(window.localStorage.getItem('nitro.room.history'));

        if (newStorage && newStorage.filter( (room: RoomDataParser) => room.roomId === roomId ).length > 0) return;

        if (newStorage && newStorage.length >= 10) newStorage.shift();

        const newData = !newStorage ? [ { roomId: roomId, roomName: roomName } ] : [ ...newStorage, { roomId: roomId, roomName: roomName } ];

        setRoomHistory(newData);
        return SetLocalStorage('nitro.room.history', newData );
    }

    useMessageEvent<GetGuestRoomResultEvent>(GetGuestRoomResultEvent, event =>
    {
        CreateLinkEvent('nitrobubblehidden/hide');
        const parser = event.getParser();

        if(!parser.roomEnter || (parser.data.roomId !== roomSession.roomId)) return;

        if(roomName !== parser.data.roomName) setRoomName(parser.data.roomName);
        if(roomOwner !== parser.data.ownerName) setRoomOwner(parser.data.ownerName);
        if(roomTags !== parser.data.tags) setRoomTags(parser.data.tags);

        onChangeRoomHistory(parser.data.roomId, parser.data.roomName);

    });
    
    useEffect(() =>
    {
        setIsOpen(true);

        const timeout = setTimeout(() => setIsOpen(false), 5000);

        return () => clearTimeout(timeout);
    }, [ roomName, roomOwner, roomTags ]);

    useEffect(() =>
    {
        setRoomHistory(JSON.parse(window.localStorage.getItem('nitro.room.history')) ?? []);
    }, [ ]);

    function toolroomhidebot()
    {
        setIsOpenHistory(false);
        document.getElementById('roomhistorytool').style.display = 'none'; 
        document.getElementById('roomsettnew').style.marginLeft = '-317px';
        document.getElementById('roomsetthide').style.display = 'none'; 
        document.getElementById('roomsettshow').style.display = 'block';
    }
    function roomsetthidebot()
    {
        setIsOpenHistory(false);
        document.getElementById('roomhistorytool').style.display = 'none'; 
        document.getElementById('roomsettnew').style.marginLeft = '19px'; 
        document.getElementById('roomsettshow').style.display = 'none'; 
        document.getElementById('roomsetthide').style.display = 'block';
    }
    
    return (
        <Flex className="nitro-room-tools-container">
            <div className="leftroomhide" id="roomsetthide" onClick={ () => toolroomhidebot() } style={ { display: 'none' } }>
                <FaChevronLeft className="fa-icon iconcenterleftiright" />
            </div>            
            <Flex center className="room_infogen p-2 d-block" id="roomsettnew" style={ { marginLeft: '25px', } }>
                <Column gap={ 1 } className="room-infogen-text roomname">
                    <Text wrap variant="white" fontSize={ 5 }>
                        <div style={ { width: '159px', overflow: 'hidden', height: '25px', } }>{ roomName }</div>
                    </Text>
                    <Text variant="muted" fontSize={ 6 }>
                        <div style={ { width: '135px', overflow: 'hidden', } }>Dueño: { roomOwner }</div>
                    </Text>
                </Column>
                { roomSession.controllerLevel >= RoomControllerLevel.ROOM_OWNER && (
                    <div className="gridinforooms">
                        <Base
                            pointer
                            title={ 'Herramienta Baw' }
                            className="iconleftgen icon icon-bawtool"
                            onClick={ () => handleToolClick('bawtool') }
                            style={ { marginTop: -4 } }
                            onMouseOver={ () => handleMouseOver('bawtool') }
                            onMouseOut={ () => handleMouseOut('bawtool') }
                        >
                            <span className={ `span-textgen ${ toolHovered.bawtool ? 'visible' : 'hidden' }` }
                            >Herramienta Baw</span>
                        </Base>
                        <div className="texticonright" onClick={ () => handleToolClick('bawtool') } title={ isHovered.bawtool ? '' : 'Herramienta Baw' }></div>
                    </div>
                ) }
                <div className="gridinforooms">
                    <Base
                        pointer
                        title={ toolHovered.settings ? '' : LocalizeText('room.settings.button.text') }
                        className="iconleftgen icon icon-cog"
                        onClick={ () => handleToolClick('settings') }
                        onMouseOver={ () => handleMouseOver('settings') }
                        onMouseOut={ () => handleMouseOut('settings') }
                    >
                        <span className={ `span-textgen ${ toolHovered.settings ? 'visible' : 'hidden' }` }>Ajustes</span>
                    </Base>
                    <div className="texticonright" onClick={ () => handleToolClick('settings') } title={ toolHovered.settings ? '' : LocalizeText('room.settings.button.text') }></div>
                </div>
                <div className="gridinforooms">
                    <Base
                        pointer
                        title={ toolHovered.zoom ? '' : LocalizeText('room.zoom.button.text') }
                        onClick={ () => handleToolClick('zoom') }
                        className={ classNames('iconleftgen icon', (!isZoomedIn && 'icon-zoom-less'), (isZoomedIn && 'icon-zoom-more')) }
                        onMouseOver={ () => handleMouseOver('zoom') }
                        onMouseOut={ () => handleMouseOut('zoom') }
                    >
                        <span className={ `span-textgen ${ toolHovered.zoom ? 'visible' : 'hidden' }` }>Zoom</span>
                    </Base>
                    <div className="texticonright" style={ { marginLeft: 16 } } onClick={ () => handleToolClick('zoom') } title={ toolHovered.zoom ? '' : LocalizeText('room.zoom.button.text') }></div>
                </div>
                <div className="gridinforooms">
                    <Base
                        pointer
                        title={ toolHovered.chat_history ? '' : LocalizeText('room.chathistory.button.text') }
                        onClick={ () => handleToolClick('chat_history') }
                        className="iconleftgen icon icon-chat-history"
                        onMouseOver={ () => handleMouseOver('chat_history') }
                        onMouseOut={ () => handleMouseOut('chat_history') }
                    >
                        <span className={ `span-textgen ${ toolHovered.chat_history ? 'visible' : 'hidden' }` }>Chat History</span>
                    </Base>
                    <div className="texticonright" onClick={ () => handleToolClick('chat_history') } title={ toolHovered.chat_history ? '' : LocalizeText('room.chathistory.button.text') }></div>
                </div>
                <div className="gridinforooms">
                    <Base
                        id="bubble"
                        pointer
                        title={ toolHovered.hiddenbubbles ? '' : 'Burbujas de chat' }
                        onClick={ () => handleToolClick('hiddenbubbles') }
                        className="iconleftgen icon icon-chat-enablebubble"
                        onMouseOver={ () => handleMouseOver('hiddenbubbles') }
                        onMouseOut={ () => handleMouseOut('hiddenbubbles') }
                    >
                        <span className={ `span-textgen ${ toolHovered.hiddenbubbles ? 'visible' : 'hidden' }` }>Burbujas de chat</span>
                    </Base>
                    <div className="texticonright" onClick={ () => handleToolClick('hiddenbubbles') } title={ toolHovered.hiddenbubbles ? '' : 'Burbujas de chat' }></div>
                </div>
                { navigatorData.canRate && (
                    <div className="gridinforooms">
                        <Base
                            pointer
                            title={ toolHovered.like_room ? '' : LocalizeText('room.like.button.text') }
                            onClick={ () => handleToolClick('like_room') }
                            className="iconleftgen icon icon-like-room"
                            onMouseOver={ () => handleMouseOver('like_room') }
                            onMouseOut={ () => handleMouseOut('like_room') }
                        >
                            <span className={ `span-textgen ${ toolHovered.like_room ? 'visible' : 'hidden' }` }>Like Room</span>
                        </Base>
                        <div className="texticonright" onClick={ () => handleToolClick('like_room') } title={ toolHovered.like_room ? '' : LocalizeText('room.like.button.text') }></div>
                    </div>
                ) }

            </Flex>
            <div className="leftroomhideshow" id="roomsettshow" onClick={ () => roomsetthidebot() }>
                <FaChevronRight className="fa-icon" />
            </div>
            <div className="nitro-room-tools-history" id="roomhistorytool" style={ { display: 'none', bottom: !navigatorData.canRate ? '180px' : '210px' } }>
                <TransitionAnimation type={ TransitionAnimationTypes.SLIDE_LEFT } inProp={ isOpenHistory }>
                    <Column center>
                        <Column className="nitro-room-history rounded py-2 px-3">
                            <Column gap={ 1 }>
                                { roomHistory.length > 0 &&
  roomHistory.map(history => (
      <Text key={ history.roomId } bold={ history.roomId === navigatorData.currentRoomId } variant={ history.roomId === navigatorData.currentRoomId ? 'white' : 'muted' } pointer onClick={ () => TryVisitRoom(history.roomId) }>
          { history.roomName }
      </Text>
  )) }
                            </Column>
                        </Column>
                    </Column>
                </TransitionAnimation>
            </div>
        </Flex>


    );
}
