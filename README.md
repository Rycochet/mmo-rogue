#summary Basic game design ideas.

### Introduction

This is how the game should react and interact. 

### User Interface

- Browser based - using HTML5 Canvas elements for maps
- Isometric tiles
- One click to move / attack / collect / etc (no overloading right click)
- Clicking on an item with multiple actions gives a menu (dropdown?) of options
- Inventory, Equipment, Stats etc are all floating displays in the browser window (only one tab needed).
- Keyboard control needed - tab between displays with optional keyboard movement controls at all times
- Map (dungeon etc) has LOS (line of sight) - no map data sent to client till they have potential LOS on it
- Hidden monsters have an id and fog but don't move when not seen - so player knows last location, but not current location
- Map is always reset to "not known" when entering a level - you must explore to fill it
- Inventory is grouped and then alphabetical - possibly tabs of types (lazy loading until needed)

---

### Gameplay

- While in "public" areas like town there is no fighting or mobs
- Game continues running while player is connected - tick of 1 second
- Monsters may have different speeds for movement
- Pause button (?)
- Inventory size limited by weight, possibly with a limited number of items to prevent stupidity :-P
- Items can be combined with "natural" results - fire + oil = bad...
- Items need identifying the first time - magical items always need to be identified
- Item types (such as potions, scrolls etc) only need to be identified once per player - but the "identified" flag follows the item itself

#### Stats & Experience

- Stats are 1-100, internal work is run off square root, so skill power advancement is non linear, but stat gain per level is always the same
- Experience per level is linear (exp gain needed to level = 1000 x level)
- (Possible) Stats: str, dex, int, wis, con, cha
- Players must visit the town to level up (regardless of exp gained)

All these are rough, subject to change, and subject to equipment:
- Hitpoints = 10 + level x sqrt(con)
- Mana = 10 + level x sqrt(wis)
- Party size = sqrt(cha)
- Skill points per level = sqrt(int)
- Damage = sqrt(str)
- Defense = sqrt(dex)

##### Classes & Skills

- Classes only specify starting skills and equipment
- Skills are capable of being improved by training (and practice?)
- Some skills inhibit others - might and magic don't play nicely
- Skills go from 0-100, untrained cannot use it at all
- Skill use goes on the square root (affected by sqrt of relevant stat)
- (Possible) Skills: might / magic, stealth / armour, accuracy / rage
- Cost (difficulty?) of increasing any skill is based on the sum of it and it's opposite

#### Parties

- Players may group together and dungeon crawl as a party
- Parties get tougher monsters, but better loot
- Player may close window (tab etc) at any time - when the last member of a party quits the dungeon will pause (if player is alone then it will pause when they quit)
- One player leads a party
- Party size is limited by charisma of leader
- Players may "hire" npc's to fill out their party

---

### Server

- PHP + MySQL
- Client is *completely* untrusted - all data is checked
- Dungeon maps are generated the first time they are visited - they are populated as an instance when someone goes in
- Only one instance per player per time - leave a party and lose that instance
- Instance is stored until another is created (delete after xx days unused?)
- Monsters are capable of having an inventory - only items which affect the monsters stats are created before death (or theft etc)
- Inactive data (unused for more than a week?) is automatically archived - restore is transparent and automatic

#### Maps

- Maps are stored in square blocks with a level and coordinates - only terrain is stored in this map data
- All map contents including doors are generated when the map is instanced
- Not all dungeons go down to the same depth - deepest level is related to the level of the player who first created the last floor of it
- (Over time) add more dungeon generation algorithms to give a variety of styles

##### Instancing

- All instance data is stored in an sql table
- Map is loaded from database
- Random point is chosen to be entrance
- "Walk" map (distance from entrance) is created
- Random point at 3/4 max walk distance is chosen to be exit (if allowed)
- Doors are added in relevant places - depends on rooms entrance etc
- Chests are added in random locations
- Mobs are added
- Any keys added (in mob or chest) must be in a "walk" distance less than the lock (door or chest)