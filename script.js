/* 
    YOU CAN USE THIS CHANNEL ID I DON'T MIND BUT YOU HAVE THE 
    OPTION TO CREATE YOUR OWN !! 
*/
const CHANNEL_ID = 'lax4dRQepbNPZJGQ';

/* SOME VARIABLES DECLARED HERE */
let counts = 1 ; 
const PREFIX = "THE_OLD_TRAVELLER" ;
let members = [] ; // TO STORE MEMBERS IN A ROOM !!
const initialize = () => {
    for ( let i = 0 ; i < visited.length ; i++ ) {
        visited[i] = false ; 
    }
};

const updateRoomStuff = (whoWent) => {
    visited[whoWent] = false ;
};

// FOR EVERYONE WE NEED DIFFERENT - RANDOM COLORS !! 
// NOTE : THE SINCE IT IS RANDOM ONE WE CAN HAVE ADJACENT COLORS TO BE 
//        THE SAME !!!
const getRandomColor = () => {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

const statsForToday = () => {
    alert("THE TOTAL PEOPLE ONLINE ARE : " + members.length );
};

/* TO ACCESS THE VARIOUS DOM ELEMENTS AND TO PIN THE CHATS !! */
const DOM = {
    membersCount: document.querySelector('#online-members'),
    membersList: document.querySelector('#members-list'),
    messages: document.querySelector('#users-message-display'),
    input: document.querySelector('#users-message'),
    sendMessageButton : document.querySelector('#sendMessageButton'),
    peopleOnlineCount : document.querySelector('#people-online-count'),
};

const getRandomName = () => {
    return PREFIX + " : " + Math.floor(Math.random()*100 + 1) ;
};  

/* DECLARE A DRONE OBJECT !! */
const drone = new ScaleDrone(CHANNEL_ID, {
 data: {
   name: getRandomName() ,
   color: getRandomColor(),
 },
});

/* 
    SET OF OPTIONS THAT IS RELATED TO THE ACTUAL RENDERING OF THE 
    CHAT ROOMS !! 
*/
drone.on( 'open' , (error) => {
    if ( error ) console.error(error);
    else {
        console.log("SUCCESSFULLY CONNECTED !! ");
        /* DECLARE THE ROOM INSTANCE */
        const room = drone.subscribe('observable-room');
        
        /* EVENTS FOR THE ROOM */
        
        // 1) ON OPENING A CONNECTION TO A ROOM !!
        room.on('open' , (error) => {
            if (error) {
                console.error(error); 
            } else {
                console.log("SUCCESSFULLY JOINED ROOM !!");
            }
        });     

        // 2) SHOWS WHO ALL ARE ONLINE !! ONLY ONCE EMITTED ...
        room.on('members' , (online) => {
            console.log (online);
            members = online ; 
            console.log(members);
            updateMembersDOM();
        });

        // 3) WHEN MEMBERS JOIN ...
        room.on('member_join' , (newPerson) => {
            members.push(newPerson);
            counts++ ; 
            updateMembersDOM();
        });

        // 4) WHEN SOMEONE LEAVES THE ROOM ...
        room.on('members_leave' , ({id}) => {
            const index = members.findIndex( members => members.id === id ) ;
            // REMOVE THE MEMBER FROM THE MEMBERS ARRAY ...
            members.splice( index , 1 ) ;
            visited[index] = false;
            counts-- ; 
            updateMembersDOM();
        });

        // 5) NOW MAIN THING IS WHEN SOMEONE SENDS A MESSAGE HOW DO WE KNOW ? 
        //    THIS IS BY CALLING THE EVENT !! 
        room.on('data' , ( text , member ) => {
            if ( member ) {
                addMessageToListDOM(text , member);
            } else {
                console.log("SERVER DATA !!") ; 
            }
        });
    }
});

// CREATE MEMBER WITH THE DESIRED PICKED COLOR !! 
const createMemberElement = (member) => {
    const { name , color } = member.clientData ;
    const el = document.createElement('li');
    el.appendChild(document.createTextNode(name)); // FOR NOW !
    el.className = 'has-text-centered' ; 
    el.style.color = color ; 
    el.style.font = 'bolder' ; 
    return el ; 
};

// UPDATE ON CHANGE !! PREVIOUSLY DEFINED !
const updateMembersDOM = () => {
    DOM.membersCount.innerText = `PEOPLE ONLINE : ${ members.length }` ; 
    DOM.peopleOnlineCount.innerText = members.length ; 
    DOM.membersList.innerHTML = '' ; 
    // ADD ALL OF THEM TO THE EMPTY LIST !! 
    for( let i = 0 ; i < members.length ; i++ ) {
        DOM.membersList.append(createMemberElement(members[i]));
    }
};

// TO CREATE THOSE BUBBLE LIKE ELEMENTS !! FOR THE MESSAGES FROM USERS !!
const createMessageElement = (text , member) => {
    // CREATE EACH MESSAGE BUBBLE !! 
    let { name , color } = member.clientData ; 
    const newOne = document.createElement('div');
    newOne.classList.add('notification', 'black-border');
    const h3Name = document.createElement('h3');
    h3Name.style.color = color ; 
    h3Name.appendChild(document.createTextNode(name));
    newOne.appendChild(h3Name);
    newOne.appendChild(document.createTextNode(text));
    return newOne ;
};

// MESSAGE IS ADDED TO MESSAGE CONSOLE ...
const addMessageToListDOM = (text , member) => {
    const el = DOM.messages ; 
    const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight ; 
    el.appendChild(createMessageElement(text , member)) ;
    if (wasTop) {
        el.scrollTop = el.scrollHeight - el.clientHeight ;
    } else {
        console.log("NOT WAS ON TOP !");
    }
};

// SUBMIT MESSAGE FUNCTION SUBMITS ONLY WHEN MESSAGE IS NOT EMPTY !
const sendMessage = () => {
    const value = DOM.input.value ; 
    if ( value != '' ) {
        DOM.input.value = '' ;
        drone.publish({
            room : 'observable-room' , 
            message : value,
        });
    }
};

// LISTEN TO THE GREEN SUBMIT BUTTON !
DOM.sendMessageButton.addEventListener('touchstart click',sendMessage);
DOM.sendMessageButton.addEventListener('click',sendMessage);

