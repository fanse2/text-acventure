let main = document.querySelector("main")
let input = document.querySelector("input")

function print(text){
    let p = document.createElement('p')
    p.innerHTML = text
    main.appendChild(p)
    p.scrollIntoView()
}

let character = {
    inventory: [],
    location: "west room"
}

var dungeon = {
    "west room": {
      short_description: "west room",
      long_description:
        "the west end of a sloping east-west passage of barren rock.",
      contents: ["pail of water", "dragon tooth"],
      exits: { east: "centre room" }
    },
    "east room": {
      short_description: "east room",
      long_description:
        "a room of finished stone with high arched ceiling and soaring columns.",
      contents: [],
      exits: { west: "centre room" }
    },
    "centre room": {
      short_description: "centre room",
      long_description:
        "the very heart of the dungeon, a windowless chamber lit only by the eerie light of glowing fungi high above. A rope hangs down from a room above.",
      contents: ["golden key", "spiral hourglass"],
      exits: { east: "east room", west: "west room", up: "attic room" }
    },
    "attic room": {
      short_description: "attic room",
      long_description:
        "the attic. It looks like it hasn't been entered in years. This place is filled with cobwebs, and a dirty window overlooks the roof, but is painted shut.",
      contents: ["crowbar", "spear"],
      exits: {
        down: "centre room",
        east: "closet"
      }
    },
    roof: {
      short_description: "roof",
      long_description:
        "the long, sloping roof. There is a gargoyle nearby watching you.",
      contents: [],
      exits: {
        east: "attic room",
        in: "attic room"
      }
    },
    closet: {
      short_description: "closet",
      long_description: "a dark, musty closet, which makes you want to sneeze.",
      contents: ["wire coathanger"],
      exits: {
        west: "attic room"
      }
    },
    lab: {
      short_description: "secret laboratory",
      long_description:
        "a secret lab filled with bubbling vials and the static discharge of Jacob's ladders and Van de Graff generators",
      contents: ["batteries"],
      exits: {
        up: "closet"
      }
    }
}

const help = `Try typing a direction, like "east" or "up'. You if you are in a room with items, you can type "take [item]" or even "take all" to pick up everything in the room. To see the long description of a room, including items and exits, type "look." You can type "inventory" to see what you are carrying, "quit" to exit the game, and "help" to see these instructions again.`

function command_split(str){
    let parts = str.split(/\s+/)
    let command = parts.shift()
    let object = parts.join(" ")
    return [command, object]
}

let room, command, verb, obj

function remove(array, item){
    let idx = array.indexOf(item)
    if(idx > -1){
        array.splice(idx, 1)
    }
}

function long_direction(short){
    let key = short[0]
    return {
        n: "north",
        s: "south",
        e: "east",
        w: "west",
        u: "up",
        d: "down",
        i: "in",
        o: "out",
    }[key]
}

function move_to_room(room_name){
    character.location = room_name
    room = dungeon[room_name]
    describe(room)                    
}

function move(verb){
    let direction = long_direction(verb)

    if(direction === "east" && room.short_description === "closet"){
        print("Moving futher back in the dark closet, you find stairs going down")
        move_to_room("lab")
    } else if(room.exits[direction]){
        move_to_room(room.exits[direction])
    } else{
        print("You cannot go that way")
    }
}

function printInventory(){
    print("You are carrying:")
    character.inventory.forEach(item=>{
        print("&nbsp;&nbsp;&nbsp;&nbsp;" + item)
    })
}

function describe(room, force){
    if(force || !room.visited){
        print("You are in " + room.long_description)
        room.visited = true
    } else{
        print(room.short_description)
    }
    let exits = Object.keys(room.exits)
    if(exits.length > 1){
        let last_exit = exits.pop()
        print("There are exits to the " + exits.join(", ") + " and " + last_exit)
    } else{
        print("There is an exit to the " + exits[0])
    }
    room.contents.forEach(item=>{
        print("There is a " + item + " here")
    })
}

function take_item(obj){
    if(obj === "all"){
        if(room.contents){
            while(room.contents.length){
                let item = room.contents.pop()
                print("You pick up the " + item)
                character.inventory.push(item)
            }            
        } else{
        print("There is nothing to take!")
        }
    } else{
        let found = false
        room.contents.forEach(item=>{
            if(item.includes(obj)){
                found = true
                print("You pick up the " + item)
                character.inventory.push(item)
                remove(room.contents, item)
            }
        })
        if(!found){
            print("There is no " + obj + " here.")
        }
    }
}

function item_from(arr, obj){
    for(let idx in arr){
        let thing = arr[idx]
        console.log("is a %s a %s", thing, obj)
        if(thing.includes(obj)){
            return thing
        }
    }
    return null
}

function use_item(obj){
    let item = item_from(character.inventory, obj)
    if(!item){
        print("You aren't carrying a " + obj)
        return
    }

    if(item === "crowbar" && character.location === "attic room"){
        print("You swing the crowbar, smashing open the window!")

        dungeon["attic room"].exits.out = "roof"
        dungeon["attic room"].exits.west = "roof"
    } else{
        print("The " + item + " does nothing here.")
    }
}

function drop_item(obj){
    let item
    if(obj === 'all'){
        if(character.inventory){
            while(character.inventory.length){
                item = character.inventory.pop()
                print("You dropped the " + item)
                room.contents.push(item)
            }
        } else{
            print("you aren't carrying anything")
        }
    } else{
        let found = false
        character.inventory.forEach(item=>{
            if(item.includes(obj)){
                found = true
                print("You drop the " + item + ".")
                room.contents.push(item)
            }
        })
        if(!found){
            print("You aren't carrying a " + obj + ".")
        }
    }
}

room = dungeon[character.location]
describe(room)

function getOneCommand(text){
    room = dungeon[character.location]
    command = command_split(text.toLowerCase())
    verb = command[0]
    obj = command[1]
    console.log("verb: " + verb + ", object: " + obj)
    if([
        "east",
        "west",
        "north",
        "south",
        "up",
        "down",
        "in",
        "out",
        "e",
        "w",
        "n",
        "s",
        "u",
        "d"        
    ].includes(verb)){
        move(verb)
    } else if(["inventory", "in", "i"].includes(verb)){
        printInventory()
    } else if(["look", "examine", "describe", "l"].includes(verb)){
        describe(room, true)
    } else if(["use","try","apply"].includes(verb)){
        use_item(obj)
    } else if(["take", "pickup", "t"].includes(verb)){
        take_item(obj)
    } else if(["drop", "throw", "release"].includes(verb)){
        drop_item(obj)
    }
}

function getInput(evt){
    if(evt.code === "Enter"){
        let text = input.value
        input.value = ""
        console.log(text)
        getOneCommand(text)
    }
}

input.addEventListener("keyup", getInput, false)