import React, { forwardRef, ForwardRefRenderFunction, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import flvjs from 'flv.js'

import './style.scss'

type FlvUrl = string | string[];
type WindowCount =  1 | 2 | 4 | 6 | 9;

interface Props {
    url: FlvUrl; // flv流地址
    defaultWindowCount?: WindowCount;
    windowCountType?: Array<WindowCount>;
    videoRender?: () => React.ReactNode[];
}

interface FlvPlayerRefHandle {
    addUrl: (addUrl: FlvUrl) => void; // 增加一个或多个视频流
}
const windowCountTypeMap: Record<WindowCount, any> = {
    1: { r: 1, c: 1 },
    2: { r: 1, c: 2 },
    4: { r: 2, c: 2 },
    6: { r: 3, c: 2 },
    9: { r: 3, c: 3 },
}


const FlvPlayer: ForwardRefRenderFunction<FlvPlayerRefHandle, any> = (props: Props, ref) => {
    const { url, defaultWindowCount = 1, windowCountType, videoRender } = props
    const [windowCount, setWindowCount] = useState<WindowCount>(defaultWindowCount)
    const playerIndex = useRef(0);
    const [playerList, setPlayerList] = useState<flvjs.Player[]>([])
    const gridTemplate = useMemo(() => ({ r: windowCountTypeMap[windowCount]['r'], c: windowCountTypeMap[windowCount]['c']}), [windowCount])

    useImperativeHandle(ref, () => ({
        addUrl: (addUrl) => startPlayVideo(addUrl)
    }))
    
    // 按窗口个数生成对应数量vide容器
    const generateVideoEl = useCallback(() => {
        const videos: any = []
        for (let i = 0; i < windowCount; i++) {
             videos.push(<div className='video-box' key={i}><video id={`video_${i}`} className="video-ele" key={i} controls>
                your bowser
            </video></div>)
        }
        return videos
    }, [windowCount])

    useEffect(() => {
        startPlayVideo(url)
    }, [url])

    const startPlayVideo = (flvUrl: FlvUrl) => {
        if (!flvUrl) return
        const urlType = typeof flvUrl;
        if (urlType === 'string') {
            flvUrl = [flvUrl] as string[]
        } 
        if (Array.isArray(flvUrl) && flvUrl.length > 0) {
            const videoContainer = document.querySelector('.flv-player-container');
            const videoEls =  videoContainer?.querySelectorAll('video')!;
            flvUrl.forEach((item: string) => {
                if (playerList[playerIndex.current]) {
                    // 已经在播放的视频先销毁
                    playerList[playerIndex.current].destroy()
                }
                console.log(playerIndex.current)
                // 根据playerIndex和url实例化播放器
               const playerInstance =  playerList[playerIndex.current] = flvjs.createPlayer({
                    url: item,
                    type: 'flv'
                })
                
                playerInstance.attachMediaElement(videoEls[playerIndex.current]);
                playerInstance.load();
                playerInstance.play();
                setPlayerList([...playerList])
                movePlayerIndex()
            })
        }

    }

    const movePlayerIndex = () => {
        if (playerIndex.current < windowCount -1) {
            playerIndex.current = playerIndex.current + 1
        } else {
            playerIndex.current = 0
        }
    }

    return <div className='flv-player-wrapper'>
        <div className="flv-player-container" style={{
            display: 'grid',
            width: '100%',
            gridTemplate: `repeat(${gridTemplate.r}, 1fr) / repeat(${gridTemplate.c}, 1fr)`
        }}>
            {videoRender?.() ?? generateVideoEl()}
        </div>
        {windowCountType && <div className="flv-player-count-bar"></div>}
    </div>
}

const ForwarFlvPlayer = forwardRef(FlvPlayer)
export default ForwarFlvPlayer

export {
    ForwarFlvPlayer as FlvPlayer
}