const dataBase=require('./db');
dataBase.setDatabase(require('../dataBase.json'),'en');
import {getUnitSlots,getChoiceMax,setChoiceCount,getSlotCounts} from './wargearModel'
import {createUnit,resetRoster} from './rosterModel'
test('tank',()=>{
 resetRoster();
 const ds=dataBase.data.datasheet.find(d=>d.name==='Tankbustas');
 let u=createUnit(ds.id);
 const slot=()=>getUnitSlots(u).find(s=>s.choices.length==3);
 const pulsa=()=>slot().choices.find(c=>/Pulsa/.test(c.label));
 const two=()=>slot().choices.find(c=>/^2×/.test(c.label));
 u={...u,loadouts:setChoiceCount(u,slot(),pulsa().id,1)};
 expect(getChoiceMax(u,slot(),two().id)).toBe(1);
 u={...u,loadouts:setChoiceCount(u,slot(),two().id,1)};
 expect(getChoiceMax(u,slot(),pulsa().id)).toBe(1);
 expect(getChoiceMax(u,slot(),two().id)).toBe(1);
});
