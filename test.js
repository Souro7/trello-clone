async function getData() {
    try {
        const res = await fetch('https://api.trello.com/1/members/me/boards?key=85da509c7f624a2235bffc69952e73ac&token=84501030b02c65d610dd670050ce231ccca3da528e493cddf15086188f1c3789')
        console.log(res.json())
    }
    catch (e) {
        console.log(`Error: 
        ${e}`);
    }


}

getData()


