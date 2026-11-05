import { useLayoutEffect } from 'react'
import { Check, Copy, FileDiff, Link2 } from 'lucide-react'
import { Badge, Bar, Button, Code, Field, Count, States, Collapse, Stage, Window, type Act } from '../kit'
import './hero.css'

type S = { url: string; focused: boolean; pending: boolean; saved: boolean; diff: boolean; copied: boolean }
const URL='nexon.com/…/patch-notes'
const initial:S={url:'',focused:false,pending:false,saved:false,diff:false,copied:false}
const poster:S={...initial,url:URL,saved:true,diff:true}
const REST={wide:{x:500,y:278},compact:{x:288,y:280}}
async function script(a:Act<S>){
 await a.wait(600)
 a.mark('paste')
 await a.click({at:'url',x:.22,y:.5})
 await a.set({focused:true})
 await a.key('cmd+v')
 await a.set({url:URL})
 await a.wait(700)
 await a.wait(250)
 a.mark('save')
 await a.click({at:'save',x:.82,y:.55})
 await a.set({focused:false,pending:true})
 await a.wait(650)
 await a.set({pending:false,saved:true})
 await a.move('rest')
 await a.wait(600)
 a.mark('compare')
 await a.click({at:'compare',x:.84,y:.55})
 await a.set({diff:true})
 await a.move('rest')
 await a.wait(1200)
 a.mark('copy')
 await a.click({at:'copy',x:.8,y:.55})
 await a.set({copied:true})
 await a.move('rest')
 await a.wait(2200)
 a.mark('result')
}
export function HeroDemo({still=false}:{still?:boolean}){
 useLayoutEffect(()=>{document.querySelectorAll('.md-show .ss-field__chars, .md-show .ss-field__value').forEach(node=>node.setAttribute('data-typing',''));},[])

 return <Stage<S> width={600} height={340} compact={{below:560,width:358,height:340}} initial={initial} poster={poster} script={still?undefined:script} play="once" cursor={{at:REST,style:'real'}} className="md-show" greys="cool" tokens={{'--ss-accent':'#b84d24','--ss-accent-soft':'#fbede6','--ss-accent-text':'#993c1a','--ss-surface':'#ffffff','--ss-canvas':'#fafbf9','--ss-chrome':'#f6f8fa','--ss-text-strong':'#24292f','--ss-text':'#656d76','--ss-line':'#d8dee4','--ss-radius-md':'6px','--ss-font':'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
 {(s,_rect,layout)=><>
  <Window url="nyshift.com/lab/maplediff" className="md-browser">
   <div className="md-content">
    
    <div className="md-import">
     <Field className="md-url" value={s.url} placeholder={layout==='compact'?'Patch-note URL':'Paste a patch-note link'} focused={s.focused} leading={<Link2 size={14} strokeWidth={1.8}/>} box={{'data-target':'url','data-cursor':'ibeam'}}/>
     <Button variant={s.saved?'secondary':'primary'} size="large" data-target="save" data-cursor="hand" ><States value={s.pending?'saving':s.saved?'saved':'idle'} states={{idle:layout==='compact'?'Save':'Save snapshot',saving:'Saving…',saved:'Saved'}}/></Button>
    </div>
    <div className="md-controls">
     <div className="md-revisions"><FileDiff size={14} strokeWidth={1.8}/><span>Revisions</span><Count value={s.saved?2:1}/></div>
     <div className="md-actions"><Button size="medium" data-target="compare" data-cursor="hand" variant="secondary">Compare</Button><Button size="medium" data-target="copy" data-cursor="hand" icon={<States value={s.copied?'done':'copy'} states={{copy:<Copy size={14} strokeWidth={1.8}/>,done:<Check size={14} strokeWidth={1.8}/>}}/>} variant="ghost"><States value={s.copied?'done':'copy'} states={{copy:'Copy link',done:'Copied'}}/></Button></div>
    </div>
    <div className="md-document" data-diff={s.diff||undefined}>
     <div className="md-file"><span>patch-notes.md</span><Badge>Example</Badge></div>
     <div className="md-output">
      <Code className="md-code" highlight={false} lines={['## Hero','Raging Blow']}/>
      <Code className="md-code" highlight={false} start={3} lines={[{text:'Damage: 320% per hit.',kind:s.diff?'del':undefined}]}/>
      <Collapse open={s.diff}><Code className="md-code" highlight={false} start={3} lines={[{text:'Damage: 350% per hit.',kind:'add'}]}/></Collapse>
      <Code className="md-code" highlight={false} start={4} lines={['Targets: 8 enemies.']}/>
     </div>
    </div>
   </div>
  </Window>
  <span data-target="rest" style={{position:'absolute',left:REST[layout].x,top:REST[layout].y}}/>
 </>}
 </Stage>
}
