import "./config/config";
import '../styles/main.scss';

//console.log(process.env.API_KEY)
//const boardId = "5c949e2d0819d68f69945065"
const cardId = "5c949e3e3ecd1961716fb4d8"
//5c73af3acf5a700e66a2d5f4 - souro
//5c949e3e3ecd1961716fb4d8 - test
let allCheckLists = []
const url = "https://api.trello.com/1/"
const auth = `key=${process.env.API_KEY}&token=${process.env.TOKEN}`


$(document).ready(init)

//initial load and main
async function init() {
    let card = await getCard()
    console.log(card)
    allCheckLists = card.idChecklists
    console.log(allCheckLists)
    displayChecklists(card.name)

    //add new checklist
    $(".button").click(async function () {
        console.log($(".new-check").val())

        await addCheckList($(".new-check").val())
            .then(data => {
                console.log(data.id)
                allCheckLists.push(data.id)
            })
        displayChecklists(card.name);


    });

    //delete a checklist and add an item to checklist
    $(".checklists").click(async function (e) {
        console.log($(e.target).attr("class"))
        if ($(e.target).attr("data-id") === undefined)
            return;

        //to delete checklist
        if ($(e.target).attr("class") === "delete") {
            await deleteCheckList($(e.target).attr("data-id"))

            //remove the checkList from allCheckLists[] and then
            for (let i = 0; i < allCheckLists.length; i++) {
                if (allCheckLists[i] === $(e.target).attr("data-id")) {
                    allCheckLists.splice(i, 1);
                }
            }
        }


        //to add an item to the checklist
        if ($(e.target).attr("class") === "add-item") {
            //console.log($(e.target).attr("id"))
            //console.log($(e.target).attr("id").charAt($(e.target).attr("id").length - 1))
            //console.log($("#new-item-" + $(e.target).attr("id").charAt($(e.target).attr("id").length - 1)).val())
            let checkList = $(e.target).attr("data-id")
            let value = $("#new-item-" + $(e.target).attr("id").charAt($(e.target).attr("id").length - 1)).val()
            await addItemToCheckList(checkList, value)
        }

        //to delete checklist item
        if ($(e.target).attr("class") === "delete-item") {
            console.log("deleted")
        }



        displayChecklists(card.name);

    })


}

//display all checklists
async function displayChecklists(cardName) {
    $(".card-title").html(`<h2>${cardName}</h2>`)
    $(".checklists").empty()
    for (let i = 0; i < allCheckLists.length; i++) {
        let checkList = await getCheckList(allCheckLists[i])
        $(".checklists").append(`<div class='checklist-${i + 1}' style="min-height: 10rem;">
                                    <div class="delete-checklist"><h4> ${checkList.name}</h4>
                                    <button type="button" data-id="${checkList.id}" class="delete" id="delete-checklist-${i + 1}">Delete</button>
                                    <button type="button" data-id="${checkList.id}" class="edit" id="edit-checklist-${i + 1}">Edit</button>
                                    </div>
                                    <div class="add-item-div"><input type="text" class="new-item" id="new-item-${i + 1}"><button type="button" data-id="${checkList.id}" class="add-item" id="add-${i + 1}">Add item</button></div>                                
                                    </div>`)

        for (let j = 0; j < checkList.checkItems.length; j++) {
            $(`.checklist-${i + 1}`).append(`<input id="item-${j}" type='checkbox' value='${checkList.checkItems[j].state}'><span style="padding-right:2em;">${checkList.checkItems[j].name}</span>
            <button class="delete-item" style="padding: 0px 1px;">Delete</button>
            <button class="edit-item" style="padding: 0px 1px;">Edit</button><br>`)
            if ($(`#item-${j}`).val() === "complete") { $(`#item-${j}`).prop('checked', true) }
        }
    }
}


//get a card by id
async function getCard() {
    const card = await fetch(`${url}cards/${cardId}?attachments=false&attachment_fields=all&members=false&membersVoted=false&checkItemStates=false&checklists=none&checklist_fields=all&board=false&list=false&pluginData=false&stickers=false&sticker_fields=all&customFieldItems=false&${auth}`)
    return card.json()

}

//get a card by id
async function getCheckList(checkListId) {
    const checkList = await fetch(`${url}checklists/${checkListId}?fields=name&cards=all&card_fields=name&${auth}`)
    return checkList.json()
}

//add new checklist by card id
async function addCheckList(checkListName) {
    const response = await fetch(`${url}checklists?idCard=${cardId}&key=${process.env.API_KEY}&token=${process.env.TOKEN}&name=${checkListName}`, { method: "POST" })
    return response.json()
}

//delete checklist by id
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
    const response = await fetch(`${url}checklists/${checkListId}/checkItems/${checkListItemId}?${auth}`)
    return response.json()
}