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
    changeWindowCount: (count: WindowCount) => void;
}
const windowCountTypeMap: Record<WindowCount, any> = {
    1: { r: 1, c: 1 },
    2: { r: 1, c: 2 },
    4: { r: 2, c: 2 },
    6: { r: 3, c: 2 },
    9: { r: 3, c: 3 },
}

/* 
    因为默认自动播放比较打扰用户，所以还需满足以下条件之一才能自动播放，以实现更好的用户体验
    视频静音（通过加上 muted 属性）或音量设置为 0
    用户与网站进行了交互（通过点击、敲击、按键等）
    站点已被列入浏览器白名单；

    浏览器确定用户频繁使用媒体，自动加入白名单
    或者通过首选项
    或其他用户界面功能手动发生


    自动播放功能策略授予了 <iframe> 及其文档自动播放支持。

    另外，chromium 内核的浏览器满足以下条件，也可以自动播放。

    用户已将该站点添加到其移动设备的主屏幕
    或在桌面设备上安装了 PWA。
*/

const FlvPlayer: ForwardRefRenderFunction<FlvPlayerRefHandle, any> = (props: Props, ref) => {
    const { url, defaultWindowCount = 1, windowCountType, videoRender } = props
    const [windowCount, setWindowCount] = useState<WindowCount>(defaultWindowCount)
    const playerIndex = useRef(0);
    const [playerList, setPlayerList] = useState<flvjs.Player[]>([])
    const gridTemplate = useMemo(() => ({ r: windowCountTypeMap[windowCount]['r'], c: windowCountTypeMap[windowCount]['c']}), [windowCount])

    useImperativeHandle(ref, () => ({
        addUrl: (addUrl) => startPlayVideo(addUrl),
        changeWindowCount: (count) => setWindowCount(count),
    }))
    
    // 按窗口个数生成对应数量vide容器
    const generateVideoEl = useCallback(() => {
        const videos: any = []
        for (let i = 0; i < windowCount; i++) {
             videos.push(<div className='video-box' key={i}><video id={`video_${i}`} className="video-ele" key={i} controls autoPlay>
                your bowser
            </video></div>)
        }
        return videos
    }, [windowCount])

    useEffect(() => {
        playerIndex.current = 0
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
                // 根据playerIndex和url实例化播放器
               const playerInstance =  playerList[playerIndex.current] = flvjs.createPlayer({
                    url: item,
                    type: 'flv',
                }, {
                    enableWorker: false,
                    lazyLoadMaxDuration: 3 * 60,
                    seekType: 'range',
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
        {windowCountType && <div className="flv-player-count-bar">
            <div className="window-count-change-container" style={{
                display:'grid',
                gridTemplateColumns: `repeat(${windowCountType.length}, min-content)`,
                gap: '4px',
                placeContent: 'center end'
            }}>
                {windowCountType.map((item) => <div className='window-count-change-btn' onClick={() => setWindowCount(item)} key={item}>{item}</div>)}     
            </div>     
        </div>}
    </div>
}

const ForwarFlvPlayer = forwardRef(FlvPlayer)
export default ForwarFlvPlayer

export {
    ForwarFlvPlayer as FlvPlayer
}