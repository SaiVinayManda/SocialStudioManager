import {ProviderError} from './contracts.mjs';
import {validateOutput} from './schemas.mjs';
export function mockOutput(type,input={}){
  const duration=input.duration_seconds??60,count=input.scene_count??6,topic=input.topic??'A local editorial fixture';
  const lines=['At three in the morning, a voicemail arrived from a number I had buried ten years ago.','It was my sister. She whispered the name only she had ever called me. Then: do not open the door.','I checked the message date. Tomorrow. Behind me, the hallway light blinked twice, just as it had the night she vanished.','Someone knocked. Through the peephole I saw her coat, dripping rain onto a perfectly dry porch. Her face stayed in shadow.','My phone rang again. This time the voice was mine. It said: she is already inside. I turned toward the dark hallway.','On the kitchen table lay her old phone. Its screen lit up with a recording. My voice whispered: do not open the door.'];
  const scenes=Array.from({length:count},(_,i)=>({scene_number:i+1,duration_seconds:duration/count,narration:lines[i%lines.length],visual_direction:['Phone illuminating a dark bedroom','Empty hallway under flickering light','Rain against a night window','Shadow beyond a closed front door','Dark kitchen and ringing phone','Phone screen fading into darkness'][i%6],footage_keywords:['night','telephone','suspense'],transition:'Brief dissolve',sound_design:'Restrained atmospheric drone under narration'}));
  if(input.script){
    // Explicit supplied-script fixture, never represented as model generation.
    const parts=input.script.match(/[^.!?]+[.!?]+|[^.!?]+$/g)??[input.script];
    for(let i=0;i<scenes.length;i++){scenes[i].narration=count===1?input.script:(parts[i]??'').trim();scenes[i].visual_direction=`One scene illustrating ${topic}; deterministic supplied-script fixture`;scenes[i].footage_keywords=['original','local','scene'];}
  }
  const script={opening_hook:input.script?scenes[0].narration:lines[0],original_script:scenes.map(s=>s.narration).join(' '),narration_text:scenes.map(s=>s.narration).join(' '),closing_line:scenes.at(-1).narration,pacing:'Start immediately; allow brief pauses at scene endings.',scenes};
  const titles={titles:Array.from({length:5},(_,i)=>({title:`${topic.slice(0,100)} — draft ${i+1}`,platform:'all'}))};
  const captions={youtube_description:`Fictional story draft: ${topic}`,instagram_caption:`An original suspense draft. ${topic}`,facebook_caption:`Fictional suspense for editorial review: ${topic}`};
  const hashtags={youtube:['#OriginalStory','#Suspense'],instagram:['#OriginalStory','#Suspense'],facebook:['#OriginalStory']};
  const values={script_generation:script,title_generation:titles,caption_generation:captions,hashtag_generation:hashtags,storyboard_generation:{scenes},content_review:{scores:{hook_strength:7,narrative_consistency:7,clarity:8,brand_alignment:7},findings:['Deterministic test fixture. Human editorial review required.'],policy_notes:['Fictional content.'],advisory:true},content_rewriting:{revised_text:input.script??topic,change_notes:['Deterministic fixture; no live model used.'],preserved_facts:input.facts??[]},content_package:{script,titles,captions,hashtags,storyboard:{scenes}}};
  return validateOutput(type,values[type],input);
}
export class MockAdapter{
  constructor(name='mock'){this.name=name;}
  async preflight(){return {status:'available',simulated:true,reserved_cost:0};}
  async execute(task){
    if(this.name==='mock-unavailable')throw new ProviderError('provider_outage');
    if(this.name==='mock-invalid')return {output:{invalid:true},simulated:true,actual_cost:0};
    return {output:mockOutput(task.task_type,task.input),provider:this.name,model:'deterministic-fixture-v2',token_usage:null,actual_cost:0,estimated_cost:0,simulated:true,exit_code:null};
  }
}
