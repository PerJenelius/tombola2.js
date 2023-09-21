'use strict';

const app = {
    localStorageExpiry: Number.MAX_SAFE_INTEGER,
    participants: [],
    backgrundColors: [
        '#4b0082',
        '#0000ff',
        '#00ff00',
        '#ffff00',
        '#ff7f00',
        '#ff0000'
    ],
    colors: [
        '#fff',
        '#fff',
        '#000',
        '#000',
        '#000',
        '#fff'
    ]
}

const main = () => {
    fetchParticipants();
    renderNametags();
    renderNamelist();
}

const fetchParticipants = () => {
    const savedData = useLocalStorage.get('name-tombola-participants', 'default');
    if (savedData !== 'default') {
        const savedParticipants = [ ...JSON.parse(savedData).value ];
        savedParticipants.map((participant) => {
            app.participants.push(participant);
        });
    } 
}

const saveParticipants = () => {
    useLocalStorage.set('name-tombola-participants', app.participants, app.localStorageExpiry);
}

const clearNametags = () => {
    const labels = document.querySelectorAll('.participant');
    labels.forEach((label) => {
        label.remove();
    });
}

const clearNamelist = () => {
    const items = document.querySelectorAll('.nameTag');
    items.forEach((item) => {
        item.remove();
    });
}

const renderNametags = () => {
    clearNametags();
    const radius = document.querySelector('.pointerFrame').offsetWidth / 2 - 70;
    const marginLeft = window.innerWidth / 2 - radius;
    const marginTop = window.innerHeight / 2 - radius;
    const partypants = app.participants.length > 0 ? app.participants.filter(p => !p.amnesty) : [];

    partypants.map((pant, i) => {
        const colorIndex = i % app.backgrundColors.length;
        const angle = (i / (partypants.length / 2)) * Math.PI;
        const left = marginLeft + (radius * Math.cos(angle)) + radius - 50;
        const top = marginTop + (radius * Math.sin(angle)) + radius - 50;
        
        document.querySelector('#tombola').innerHTML +=
            `<p class='participant' id='${i}' 
                style='top:${top}px; left:${left}px; background-color: ${app.backgrundColors[colorIndex]}; color: ${app.colors[colorIndex]};'>
                ${pant.name}
            </p>`;
    });
}

const renderNamelist = () => {
    clearNamelist();
    const namelist = document.querySelector('#participantList');
    app.participants.map((participant, i) => {
        namelist.innerHTML += 
            `<li class='nameTag'>
                <input type='checkbox' ${participant.amnesty ? '' : 'checked'} onchange=updateStatus(${i}) />
                <span>${participant.name}</span>
            </li>`;
    });
}

const updateStatus = (index) => {
    app.participants[index].amnesty = !app.participants[index].amnesty;
    renderNametags();
    saveParticipants();
}

const startTheWheel = (event) => {
    event.preventDefault();
    const partypants = app.participants.length > 0 ? app.participants.filter(p => !p.amnesty) : [];
    const random = Math.floor(Math.random() * partypants.length);
    const fakeSpins = Math.ceil(Math.random() * 5);
    const angle = random * (360 / partypants.length);
    const totalAngle = Math.floor(fakeSpins * 360 + angle)
    const moment = 2;

    document.querySelector('#pointerArm').style.transform = 'none';
    for (let nameLabel of document.querySelectorAll('.participant')) {
        nameLabel.classList.remove('chosen');
    }

    for (let i = 0; i <= totalAngle; i++) {
        ((j) => {
            setTimeout(() => {
                document.querySelector('#pointerArm').style.transform = `rotate(${i}deg)`;
                if (i === totalAngle) {
                    document.getElementById(random).classList.add('chosen');
                }
            }, moment * j);
        })(i)
    }
}

const addOrRemoveParticipant = (event) => {
    event.preventDefault();
    const participantName = document.querySelector('#nameInput').value;
    if (participantExists(participantName)) {
        removeParticipant(participantName);
    } else {
        addParticipant(participantName);
    }
}

const addParticipant = (name) => {
    app.participants.push({ name: name, amnesty: false });
    app.participants.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) { return -1 }
        if (nameA > nameB) { return 1 }
        return 0;
    });

    console.log('app.participants', app.participants);

    renderNametags();
    renderNamelist();
    saveParticipants();
}

const removeParticipant = (name) => {
    const item = app.participants.find((item) => item.name === name);
    app.participants.splice(app.participants.indexOf(item), 1);
    renderNametags();
    renderNamelist();
    saveParticipants();
}

const participantExists = (name) => {
    let exists = false;
    app.participants.map((participant) => {
        if (participant.name === name) {
            exists = true;
        }
    });
    return exists;
}

document.querySelector('#start').addEventListener('click', (e) => startTheWheel(e), false);
document.querySelector('#addName').addEventListener('click', (e) => addOrRemoveParticipant(e), false);

if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main);
}