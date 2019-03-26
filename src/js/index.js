import "./config/config";
import "../styles/main.scss";
import { addCheckList, addItemToCheckList, getCheckList, changeCheckboxState, changeCheckitemName, changeChecklistName, deleteCheckList, deletecheckListItem, getCard, getCheckItem } from "./services";

let checkListIds = [];
$(document).ready(init);

//initial load and main
async function init() {
  let card = await getCard();
  console.log(card);
  checkListIds = card.idChecklists;
  console.log(checkListIds);
  displayChecklists(card.name);

  //add new checklist
  $(".button").click(async function() {
    console.log($(".new-check").val());

    await addCheckList($(".new-check").val()).then(data => {
      console.log(data.id);
      checkListIds.push(data.id);
    });
    $(".new-check").val("");
    displayNewChecklist();
  });

  $(".checklists").click(async function(e) {
    console.log($(e.target).attr("class"));
    if ($(e.target).attr("data-id") === undefined) return;

    //to delete checklist
    if ($(e.target).attr("class") === "delete") {
      //remove the checkList from checkListIds[] and then
      for (let i = 0; i < checkListIds.length; i++) {
        if (checkListIds[i] === $(e.target).attr("data-id")) {
          checkListIds.splice(i, 1);
        }
      }
      let checklist = $(e.target).attr("data-checklist");
      $(`.${checklist}`).remove();
      await deleteCheckList($(e.target).attr("data-id"));
    }

    //to add an item to the checklist
    if ($(e.target).attr("class") === "add-item") {
      let checkList = $(e.target).attr("data-id");
      let index = $(e.target).attr("data-checklist");
      $(`#add-item-${index}`).show();
      $(`#new-item-${index}`).hide();
      $(`#add-${index}`).hide();
      let value = $(
        "#new-item-" +
          $(e.target)
            .attr("id")
            .charAt($(e.target).attr("id").length - 1)
      ).val();
      let checkitem = await addItemToCheckList(checkList, value);
      let items = parseInt($(e.target).attr("data-items")) + 1;
      $(e.target).attr("data-items", `${items}`);
      displayNewCheckItem($(e.target).attr("data-id"), $(e.target).attr("data-checklist"), $(e.target).attr("data-items"), checkitem);
    }

    //to delete checklist item
    if ($(e.target).attr("class") === "delete-item") {
      console.log("deleted");
      let checkitem = $(e.target).attr("data-checkitem");
      $(`#${checkitem}`).remove();
      await deletecheckListItem($(e.target).attr("data-checklist-id"), $(e.target).attr("data-id"));
    }

    //to change checkbox checked value
    if ($(e.target).attr("class") === "checkbox") {
      console.log($(e.target).prop("checked"));
      if ($(e.target).prop("checked")) await changeCheckboxState($(e.target).attr("data-id"), "complete");
      else await changeCheckboxState($(e.target).attr("data-id"), "incomplete");
    }

    //to change checklist name
    if ($(e.target).attr("class") === "checklist-name") {
      let index = $(e.target).attr("data-index");
      $(`#checklist-name-${index}`).hide();
      $(`#edit-${index}`).show();
      $(`#edit-checklist-${index}`).show();
    }
    if ($(e.target).attr("class") === "edit") {
      let index = $(e.target).attr("data-index");
      $(`#checklist-name-${index}`).show();
      $(`#edit-${index}`).hide();
      $(`#edit-checklist-${index}`).hide();

      $(`#checklist-name-${index}`).html($(`#edit-${index}`).val());
      await changeChecklistName($(e.target).attr("data-id"), $(`#edit-${index}`).val());
    }

    //to change checkitem name
    if ($(e.target).attr("class") === "checkitem-name") {
      console.log("changed!!!");
      let checklist = $(e.target).attr("data-checklist");
      let checkitem = $(e.target).attr("data-checkitem");
      console.log(checklist + "-" + checkitem);
      $(`#checkitem-${checklist}-${checkitem}`).hide();
      $(`#checkitem-input-${checklist}-${checkitem}`).show();
      $(`#edit-item-${checklist}-${checkitem}`).show();
    }
    if ($(e.target).attr("class") === "edit-item") {
      let checklist = $(e.target).attr("data-checklist");
      let checkitem = $(e.target).attr("data-checkitem");
      console.log(checklist + "-" + checkitem);
      $(`#checkitem-${checklist}-${checkitem}`).show();
      $(`#checkitem-input-${checklist}-${checkitem}`).hide();
      $(`#edit-item-${checklist}-${checkitem}`).hide();

      $(`#checkitem-${checklist}-${checkitem}`).html($(`#checkitem-input-${checklist}-${checkitem}`).val());
      await changeCheckitemName($(e.target).attr("data-id"), $(`#checkitem-input-${checklist}-${checkitem}`).val());
    }

    //for add item to checklist button
    if ($(e.target).attr("class") === "add-item-button") {
      let index = $(e.target).attr("data-id");
      $(`#add-item-${index}`).hide();
      $(`#new-item-${index}`).show();
      $(`#add-${index}`).show();
    }
  });
}

//display all checklists
async function displayChecklists(cardName) {
  $(".card-title").html(`<h2>${cardName}</h2>`);
  $(".checklists").empty();
  let promises = checkListIds.map(getCheckList);
  Promise.all(promises).then(checklists => {
    checklists.forEach(function(checkList, i) {
      $(".checklists").append(`<div class='checklist-${i + 1}' style="min-height: 10rem;">
        <div class="delete-checklist"><h4 class="checklist-name" id="checklist-name-${i + 1}" data-id="${checkList.id}" data-index="${i + 1}"> ${checkList.name}</h4><input type="text" class="edit-checklist" id="edit-${i + 1}" value="${checkList.name}">
        <button type="button" data-id="${checkList.id}" data-index="${i + 1}" class="edit" id="edit-checklist-${i + 1}">Save</button>
        <button type="button" data-id="${checkList.id}" class="delete" id="delete-checklist-${i + 1}" data-checklist="checklist-${i + 1}">Delete</button>
        <button type="button" class="add-item-button" id="add-item-${i + 1}" data-id="${i + 1}" data-items="${checkList.checkItems.length}">Add an item</button>
        </div>
        <div class="add-item-div"><input type="text" class="new-item" id="new-item-${i + 1}">
        <button type="button" data-id="${checkList.id}" class="add-item" id="add-${i + 1}" data-checklist="${i + 1}" data-items="${checkList.checkItems.length}">Add item</button></div>                                
        </div>`);

      for (let j = 0; j < checkList.checkItems.length; j++) {
        $(`.checklist-${i + 1}`).append(`<div class="checklist-items" id="check-item-${i}-${j}">
<input id="item-${i}-${j}" type='checkbox' class="checkbox" data-id="${checkList.checkItems[j].id}" value='${checkList.checkItems[j].state}'>
<span style="padding-right:2em;" class="checkitem-name" id="checkitem-${i}-${j}" data-id="${checkList.checkItems[j].id}" data-checklist="${i}" data-checkitem="${j}">${checkList.checkItems[j].name}</span>
<input type="text" class="checkitem-input" id="checkitem-input-${i}-${j}" value="${checkList.checkItems[j].name}">
<button class="edit-item" id="edit-item-${i}-${j}" data-id="${checkList.checkItems[j].id}" data-checklist="${i}" data-checkitem="${j}" style="padding: 0px 1px;">Save</button>
<button class="delete-item" style="padding: 0px 1px;" data-id="${checkList.checkItems[j].id}" data-checklist-id="${checkList.id}" data-checkitem="check-item-${i}-${j}">x</button><br></div>`);
        if ($(`#item-${i}-${j}`).val() === "complete") {
          $(`#item-${i}-${j}`).prop("checked", true);
        }
      }
    });
  });
}

//display new checklist
async function displayNewChecklist() {
  let checkList = await getCheckList(checkListIds[checkListIds.length - 1]);
  console.log(checkListIds.length);
  let index = checkListIds.length;

  $(".checklists").append(`
  <div class='checklist-${index}' style="min-height: 10rem;">
  <div class="delete-checklist"><h4 class="checklist-name" id="checklist-name-${index}" data-id="${checkList.id}" data-index="${index}"> ${checkList.name}</h4><input type="text" class="edit-checklist" id="edit-${index}" value="${checkList.name}">
                                <button type="button" data-id="${checkList.id}" data-index="${index}" class="edit" id="edit-checklist-${index}">Save</button>
                                <button type="button" data-id="${checkList.id}" class="delete" id="delete-checklist-${index}" data-checklist="checklist-${index}">Delete</button>
                                <button type="button" class="add-item-button" id="add-item-${index}" data-id="${index}" data-items="${checkList.checkItems.length}">Add an item</button>
                                </div>
                                <div class="add-item-div"><input type="text" class="new-item" id="new-item-${index}"><button type="button" data-id="${checkList.id}" class="add-item" id="add-${index}" data-checklist="${index}" data-items="${
    checkList.checkItems.length
  }">Add item</button></div>                                
                                </div>`);
}

//display new checklist item

async function displayNewCheckItem(checkListId, checklistNumber, checkitemNumber, checklistObj) {
  $(`.checklist-${checklistNumber}`).append(`
    <div class="checklist-items" id="check-item-${checklistNumber - 1}-${checkitemNumber - 1}"><input id="item-${checklistNumber - 1}-${checkitemNumber - 1}" type='checkbox' class="checkbox" data-id="${checklistObj.id}" value='${
    checklistObj.state
  }'><span style="padding-right:2em;" class="checkitem-name" id="checkitem-${checklistNumber - 1}-${checkitemNumber - 1}" data-id="${checklistObj.id}" data-checklist="${checklistNumber - 1}" data-checkitem="${checkitemNumber - 1}">${checklistObj.name}</span>
    <input type="text" class="checkitem-input" id="checkitem-input-${checklistNumber - 1}-${checkitemNumber - 1}" value="${checklistObj.name}">
    <button class="edit-item" id="edit-item-${checklistNumber - 1}-${checkitemNumber - 1}" data-id="${checklistObj.id}" data-checklist="${checklistNumber - 1}" data-checkitem="${checkitemNumber - 1}" style="padding: 0px 1px;">Save</button>
    <button class="delete-item" style="padding: 0px 1px;" data-id="${checklistObj.id}" data-checklist-id="${checkListId}" data-checkitem="check-item-${checklistNumber - 1}-${checkitemNumber - 1}">x</button><br></div>
    `);

  if ($(`#item-${checklistNumber - 1}-${checkitemNumber - 1}`).val() === "complete") {
    $(`#item-${checklistNumber - 1}-${checkitemNumber - 1}`).prop("checked", true);
  }
}
