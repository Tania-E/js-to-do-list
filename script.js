var config = {
	apiKey: "AIzaSyBtaru7edjGqYmYeDygSAmTzW0r-_9DHJY",
	authDomain: "todo-56ba1.firebaseapp.com",
	databaseURL: "https://todo-56ba1.firebaseio.com",
	projectId: "todo-56ba1",
	storageBucket: "todo-56ba1.appspot.com",
	messagingSenderId: "815262067812"
};
firebase.initializeApp(config);

var list = document.getElementById('list');
var categories = document.getElementById('categories');
var form = document.getElementById('inp');
var {topic, task, date} = form;
var dataTodo = {};
var dataArr = [];
var sortList = [];

function formatTime(date) {
	if (date === '') {
		return '';
	} else {
		let year = new Date(date).getFullYear();
		let month = (new Date(date).getMonth() + 1);
		let day = new Date(date).getDate();
		let hours = new Date(date).getHours();
		let minutes = new Date(date).getMinutes();
		if ((new Date(date).getMonth() + 1) < 10) {
			month = '0' + (new Date(date).getMonth() + 1);
		}
		if (new Date(date).getDate() < 10) {
			day = '0' + new Date(date).getDate();
		}
		if (new Date(date).getHours() < 10) {
			hours = '0' + new Date(date).getHours();
		}
		if (new Date(date).getMinutes() < 10) {
			minutes = '0' + new Date(date).getMinutes();
		}
		return (year + '.' + month + '.' + day + ' ' + hours + ':' + minutes);
	}
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	var newPostRef = firebase.database().ref(`todo`).push();
	newPostRef.set({
		topic: topic.value,
		task: task.value,
		date: formatTime(date.value),
		status: 'new',
		createdAt: formatTime(new Date())
	});

	for (var i=0; i<form.length; i++) {
		form[i].value = '';
	}
});

firebase.database().ref(`todo`).on('value', function (snapshot) {
	dataTodo = snapshot.val();
	let i = 0;
	for (elem in dataTodo) {
		dataArr[i] = new TodoItem(dataTodo[elem], elem);
		i++;
	}
	render(dataArr);
	createList(dataArr);
//	console.log(dataArr);
});

function render (arr) {
	list.innerHTML = ``;
	for ( var i=0; i<arr.length; i++) {
		arr[i].creatItem();
	}
	createList(dataArr);
}

function createList(arr) {
	var listArr = [];
	categories.innerHTML = `<div class="category">Все задачи</div>
	<div class="category">Просроченные</div>`;
	arr.forEach(function (elem) {
		var topic = elem.element.topic;
		if (listArr.indexOf(topic) === -1) {
			listArr.push(topic);
			var div = document.createElement('div');
			div.className = 'category';
			div.id = topic;
			div.innerHTML = topic;
			categories.appendChild(div);
		}
	});
}

categories.onclick = function (event) {
	var text = event.target.innerText;
	if (text === 'Все задачи') {
		render(dataArr);
	} else if (text === 'Просроченные') {
		sortList = dataArr.filter(function(elem) {
			if ( elem.red === true ){
				return true;
			}
		});
	render(sortList);
	} else {
		sortList = dataArr.filter(function(elem) {
			if (elem.element.topic === text){
				return true;
			}
		});
	render(sortList);
	}
}

class TodoItem {
	constructor(element, idElem) {
		this.element = element;
		this.idElem = idElem;
		this.red = false;
	}

	creatItem () {
		var div = document.createElement('div');
		div.className = 'todo_item';
		div.id = this.idElem;
		div.innerHTML = `
			<button class="todo_item_btn1">V</button>
			<button class="todo_item_btn2">X</button>
			<h2 class="todo_item_h2" contenteditable="true">${this.element.topic}</h2>
			<p class="todo_item_p" contenteditable="true">${this.element.task}</p>
			<div class="todo_item_create">создано: ${this.element.createdAt}</div>
			<div class="todo_item_end">выполнить до: ${this.element.date}</div>`;
		list.appendChild(div);

		this.btnDelete = document.getElementById(this.idElem);
		this.btnDelete = this.btnDelete.getElementsByClassName('todo_item_btn2')[0];
		this.btnDelete.onclick = this.deleteItem.bind(this);

		this.btnDone = document.getElementById(this.idElem);
		this.btnDone = this.btnDone.getElementsByClassName('todo_item_btn1')[0];
		this.btnDone.onclick = this.doneItem.bind(this);

		this.h2 = document.getElementById(this.idElem);
		this.h2 = this.h2.getElementsByTagName('h2')[0];
		this.h2.onblur = this.editItem.bind(this);

		this.p = document.getElementById(this.idElem);
		this.p = this.p.getElementsByTagName('p')[0];
		this.p.onblur = this.editItem.bind(this);

		this.deadline();

		if (dataTodo[this.idElem].status === 'done') {
			this.btnDone.parentNode.className = 'item_done';
			this.red = false;
		}
	}

	deleteItem () {
		var et = this.btnDelete.parentNode;
		et.parentNode.removeChild(et);
		firebase.database().ref(`todo`).child(this.idElem).remove();
	}

	doneItem () {
		var et = this.btnDone.parentNode;
		if (dataTodo[this.idElem].status === 'new') {
			console.log(dataTodo[this.idElem].status);
			et.classList.add('item_done');
			firebase.database().ref(`todo`).child(this.idElem).update({status: 'done'});
		} else {
			console.log(dataTodo[this.idElem].status);
			et.classList.remove('item_done');
			firebase.database().ref(`todo`).child(this.idElem).update({status: 'new'});
		}
	}

	editItem (event) {
		var target = event.target;
		console.dir(target.innerText);
		if (target.tagName === 'H2') {
			firebase.database().ref(`todo`).child(this.idElem).update({topic: target.innerText});
		}
		if (target.tagName === 'P') {
			firebase.database().ref(`todo`).child(this.idElem).update({task: target.innerText});
		}
	}

	deadline () {
		this.dl = document.getElementById(this.idElem);
		this.dl = this.dl.getElementsByClassName('todo_item_end')[0];
		if( (new Date(this.element.date) - new Date()) < 0 && (this.element.status !== 'done') ) {
			this.dl.parentNode.className = 'deadline';
			this.red = true;
		}
		var timerId = setInterval( () => {
			if( (new Date(this.element.date) - new Date()) < 0 && (this.element.status !== 'done') ) {
				this.dl.parentNode.className = 'deadline';
				this.red = true;
			}
		}, 60000)
	}
}
