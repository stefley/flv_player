import { useRef } from 'react'
import { FlvPlayer } from '../packages'
import './App.css'
import { flv_strs } from './data/flvStr'

function App() {

  const flvRef = useRef<any>(null)
  const addUrlHandle = () => {
    flvRef?.current?.addUrl?.("wss://videos3.e6yun.com:8080/live/11236408149-1-ems-3bfd1841-acaf-46f9-96be-e9eac138db4a.flv")
  }
  return (
    <div className="App">
        <div style={{ height: 40, padding: 10, background: "rgba(10, 10, 200, .2)" }}>
          <button onClick={addUrlHandle} style={{ padding: "4px 10px"}}>add url</button>
        </div>
        <div style={{ height: 600 }}>
        <FlvPlayer ref={flvRef} url={flv_strs} windowCountType={[1,4,6]} defaultWindowCount={4} />
        </div>
    </div>
  )
}

export default App
