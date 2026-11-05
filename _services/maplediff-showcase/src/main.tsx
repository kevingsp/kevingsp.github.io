import React, {useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {HeroDemo} from './MapleDiffDemo'
import './host.css'
function Walkthrough(){
 const [run,setRun]=useState(0),[playing,setPlaying]=useState(true),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[])
 return <div className="preview-host"><div role="img" aria-label="Illustrated example of saving a patch-note URL, comparing revisions, and copying its link"><div aria-hidden="true"><HeroDemo key={`${run}-${playing}`} still={!playing}/></div></div><div className="preview-controls"><span>{reduced?'Static preview · reduced motion':'Illustrative notes'}</span><div>{!reduced&&<><button type="button" onClick={()=>setPlaying(value=>!value)}>{playing?'Show still':'Play preview'}</button><button type="button" onClick={()=>{setPlaying(true);setRun(value=>value+1)}}>Replay</button></>}</div></div></div>
}
createRoot(document.getElementById('root')!).render(<Walkthrough/>);
