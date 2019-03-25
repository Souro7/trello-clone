import "./config/config";
import '../styles/main.scss';

//console.log(process.env.API_KEY)
//const boardId = "5c949e2d0819d68f69945065"
const cardId = "5c949e3e3ecd1961716fb4d8"
//5c73af3acf5a700e66a2d5f4 - souro
//5c949e3e3ecd1961716fb4d8 - test
let checkListIds = []
const url = "https://api.trello.com/1/"
const auth = `key=${process.env.API_KEY}&token=${process.env.TOKEN}`


$(document).ready(init)

//initial load and main
async function init() {
    let card = await getCard()
    console.log(card)
    checkListIds = card.idChecklists
    console.log(checkListIds)
    displayChecklists(card.name)
    //add new checklist
    $(".button").click(async function () {
        console.log($(".new-check").val())

        await addCheckList($(".new-check").val())
            .then(data => {
                console.log(data.id)
                checkListIds.push(data.id)
            })
        displayChecklists(card.name);


    });


    $(".checklists").click(async function (e) {
        console.log($(e.target).attr("class"))
        if ($(e.target).attr("data-id") === undefined)
            return;

        //to delete checklist
        if ($(e.target).attr("class") === "delete") {
            await deleteCheckList($(e.target).attr("data-id"))

            //remove the checkList from checkListIds[] and then
            for (let i = 0; i < checkListIds.length; i++) {
                if (checkListIds[i] === $(e.target).attr("data-id")) {
                    checkListIds.splice(i, 1);
                }
            }
            displayChecklists(card.name);
        }


        //to add an item to the checklist
        if ($(e.target).attr("class") === "add-item") {
            let checkList = $(e.target).attr("data-id")
            let value = $("#new-item-" + $(e.target).attr("id").charAt($(e.target).attr("id").length - 1)).val()
            await addItemToCheckList(checkList, value)
            displayChecklists(card.name);
            console.log(checkListDetails)
        }

        //to delete checklist item
        if ($(e.target).attr("class") === "delete-item") {
            console.log("deleted")
            await deletecheckListItem($(e.target).attr("data-checklist-id"), $(e.target).attr("data-id"))
            displayChecklists(card.name);
        }


        //to change checkbox checked value
        if ($(e.target).attr("class") === "checkbox") {
            console.log($(e.target).prop("checked"))
            if ($(e.target).prop("checked")) await changeCheckboxState($(e.target).attr("data-id"), 'complete')
            else await changeCheckboxState($(e.target).attr("data-id"), 'incomplete')
            displayChecklists(card.name)
        }

        //to change checklist name
        if ($(e.target).attr("class") === "checklist-name") {
            let index = $(e.target).attr("data-index")
            $(`#checklist-name-${index}`).hide()
            $(`#edit-${index}`).show()
            $(`#edit-checklist-${index}`).show()
        }
        if ($(e.target).attr("class") === "edit") {
            let index = $(e.target).attr("data-index")
            $(`#checklist-name-${index}`).show()
            $(`#edit-${index}`).hide()
            $(`#edit-checklist-${index}`).hide()
            await changeChecklistName($(e.target).attr("data-id"), $(`#edit-${index}`).val())
            displayChecklists(card.name)
        }

        //to change checkitem name
        if ($(e.target).attr("class") === "checkitem-name") {
            console.log("changed!!!")
            let checklist = $(e.target).attr("data-checklist")
            let checkitem = $(e.target).attr("data-checkitem")
            console.log(checklist + "-" + checkitem)
            $(`#checkitem-${checklist}-${checkitem}`).hide()
            $(`#checkitem-input-${checklist}-${checkitem}`).show()
            $(`#edit-item-${checklist}-${checkitem}`).show()
        }
        if ($(e.target).attr("class") === "edit-item") {
            let checklist = $(e.target).attr("data-checklist")
            let checkitem = $(e.target).attr("data-checkitem")
            console.log(checklist + "-" + checkitem)
            $(`#checkitem-${checklist}-${checkitem}`).show()
            $(`#checkitem-input-${checklist}-${checkitem}`).hide()
            $(`#edit-item-${checklist}-${checkitem}`).hide()

            changeCheckitemName($(e.target).attr("data-id"), $(`#checkitem-input-${checklist}-${checkitem}`).val())
            displayChecklists(card.name)

        }

        //for add item to checklist button
        if ($(e.target).attr("class") === "add-item-button") {
            let index = $(e.target).attr("data-id")
            $(`#add-item-${index}`).hide()
            $(`#new-item-${index}`).show()
            $(`#add-${index}`).show()
        }

    })
}

//display all checklists
async function displayChecklists(cardName) {
    $(".card-title").html(`<h2>${cardName}</h2>`)
    $(".checklists").empty()
    for (let i = 0; i < checkListIds.length; i++) {
        let checkList = await getCheckList(checkListIds[i])

        $(".checklists").append(`<div class='checklist-${i + 1}' style="min-height: 10rem;">
                                    <div class="delete-checklist"><h4 class="checklist-name" id="checklist-name-${i + 1}" data-id="${checkList.id}" data-index="${i + 1}"> ${checkList.name}</h4><input type="text" class="edit-checklist" id="edit-${i + 1}" value="${checkList.name}">
                                    <button type="button" data-id="${checkList.id}" data-index="${i + 1}" class="edit" id="edit-checklist-${i + 1}">Save</button>
                                    <button type="button" data-id="${checkList.id}" class="delete" id="delete-checklist-${i + 1}">Delete</button>
                                    <button type="button" class="add-item-button" id="add-item-${i + 1}" data-id="${i + 1}">Add an item</button>
                                    </div>
                                    <div class="add-item-div"><input type="text" class="new-item" id="new-item-${i + 1}"><button type="button" data-id="${checkList.id}" class="add-item" id="add-${i + 1}">Add item</button></div>                                
                                    </div>`)

        for (let j = 0; j < checkList.checkItems.length; j++) {
            $(`.checklist-${i + 1}`).append(`<div class="checklist-items"><input id="item-${i}-${j}" type='checkbox' class="checkbox" data-id="${checkList.checkItems[j].id}" value='${checkList.checkItems[j].state}'><span style="padding-right:2em;" class="checkitem-name" id="checkitem-${i}-${j}" data-id="${checkList.checkItems[j].id}" data-checklist="${i}" data-checkitem="${j}">${checkList.checkItems[j].name}</span>
            <input type="text" class="checkitem-input" id="checkitem-input-${i}-${j}" value="${checkList.checkItems[j].name}">
            <button class="edit-item" id="edit-item-${i}-${j}" data-id="${checkList.checkItems[j].id}" data-checklist="${i}" data-checkitem="${j}" style="padding: 0px 1px;">Save</button>
            <button class="delete-item" style="padding: 0px 1px;" data-id="${checkList.checkItems[j].id}" data-checklist-id="${checkList.id}">x</button><br></div>`)
            if ($(`#item-${i}-${j}`).val() === "complete") { $(`#item-${i}-${j}`).prop('checked', true) }
        }

    }
}


//get a card 
async function getCard() {
    const card = await fetch(`${url}cards/${cardId}?attachments=false&attachment_fields=all&members=false&membersVoted=false&checkItemStates=false&checklists=none&checklist_fields=all&board=false&list=false&pluginData=false&stickers=false&sticker_fields=all&customFieldItems=false&${auth}`)
    return card.json()

}

//get a checklist
async function getCheckList(checkListId) {
    const checkList = await fetch(`${url}checklists/${checkListId}?fields=name&cards=all&card_fields=name&${auth}`)
    return checkList.json()
}

//add new checklist 
async function addCheckList(checkListName) {
    const response = await fetch(`${url}checklists?idCard=${cardId}&key=${process.env.API_KEY}&token=${process.env.TOKEN}&name=${checkListName}`, { method: "POST" })
    return response.json()
}

//delete checklist
async function deleteCheckList(checkListId) {
    const response = await fetch(`${url}checklists/${checkListId}?key=${process.env.API_KEY}&token=${process.env.TOKEN}`, { method: "DELETE" })
    return response.json()
}

//add item to checklist
async function addItemToCheckList(checkListId, name) {
    const response = await fetch(`${url}checklists/${checkListId}/checkItems?key=${process.env.API_KEY}&token=${process.env.TOKEN}&name=${name}`, { method: "POST" })
    return response.json()
}

//delete checklist items

async function deletecheckListItem(checkListId, checkListItemId) {
    const response = await fetch(`${url}checklists/${checkListId}/checkItems/${checkListItemId}?${auth}`, { method: "DELETE" })
    return response.json()
}

//change checkbox state

async function changeCheckboxState(checkItemId, state) {
    const response = await fetch(`${url}cards/5c949e3e3ecd1961716fb4d8/checkItem/${checkItemId}?${auth}&state=${state}`, { method: "PUT" })
    return response.json()

}

//change checklist name

async function changeChecklistName(checkListId, name) {
    const response = await fetch(`${url}checklists/${checkListId}/name?${auth}&value=${name}`, { method: "PUT" })
    return response.json()
}

//change checkitem name

async function changeCheckitemName(checkItemId, name) {
    const response = await fetch(`${url}cards/${cardId}/checkItem/${checkItemId}?${auth}&name=${name}`, { method: "PUT" })
    return response.json()
}
