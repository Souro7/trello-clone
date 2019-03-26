//console.log(process.env.API_KEY)
//const boardId = "5c949e2d0819d68f69945065"
const cardId = "5c949e3e3ecd1961716fb4d8"
//5c73af3acf5a700e66a2d5f4 - souro
//5c949e3e3ecd1961716fb4d8 - test

const url = "https://api.trello.com/1/"
const auth = `key=${process.env.API_KEY}&token=${process.env.TOKEN}`

//get a card 
export async function getCard() {
    const card = await fetch(`${url}cards/${cardId}?attachments=false&attachment_fields=all&members=false&membersVoted=false&checkItemStates=false&checklists=none&checklist_fields=all&board=false&list=false&pluginData=false&stickers=false&sticker_fields=all&customFieldItems=false&${auth}`)
    return card.json()

}

//get a checklist
export async function getCheckList(checkListId) {
    const checkList = await fetch(`${url}checklists/${checkListId}?fields=name&cards=all&card_fields=name&${auth}`)
    return checkList.json()
}

//add new checklist 
export async function addCheckList(checkListName) {
    const response = await fetch(`${url}checklists?idCard=${cardId}&key=${process.env.API_KEY}&token=${process.env.TOKEN}&name=${checkListName}`, { method: "POST" })
    return response.json()
}

//delete checklist
export async function deleteCheckList(checkListId) {
    const response = await fetch(`${url}checklists/${checkListId}?key=${process.env.API_KEY}&token=${process.env.TOKEN}`, { method: "DELETE" })
    return response.json()
}

//add item to checklist
export async function addItemToCheckList(checkListId, name) {
    const response = await fetch(`${url}checklists/${checkListId}/checkItems?key=${process.env.API_KEY}&token=${process.env.TOKEN}&name=${name}`, { method: "POST" })
    return response.json()
}

//delete checklist items

export async function deletecheckListItem(checkListId, checkListItemId) {
    const response = await fetch(`${url}checklists/${checkListId}/checkItems/${checkListItemId}?${auth}`, { method: "DELETE" })
    return response.json()
}

//change checkbox state

export async function changeCheckboxState(checkItemId, state) {
    const response = await fetch(`${url}cards/5c949e3e3ecd1961716fb4d8/checkItem/${checkItemId}?${auth}&state=${state}`, { method: "PUT" })
    return response.json()

}

//change checklist name

export async function changeChecklistName(checkListId, name) {
    const response = await fetch(`${url}checklists/${checkListId}/name?${auth}&value=${name}`, { method: "PUT" })
    return response.json()
}

//change checkitem name

export async function changeCheckitemName(checkItemId, name) {
    const response = await fetch(`${url}cards/${cardId}/checkItem/${checkItemId}?${auth}&name=${name}`, { method: "PUT" })
    return response.json()
}

export async function getCheckItem(checkListId, checkItemId) {
    const response = await fetch(`${url}checklists/${checkListId}/checkItems/${checkItemId}?${auth}`)
    return response.json()
}
