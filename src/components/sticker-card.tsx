'use client'
import { MouseEvent, ReactNode, useState } from 'react'

import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { StickerClassifyBar } from '~/components/classify-bar'

import { Sticker, StickerClassify } from '~/types'

import * as clipboard from '~/lib/clipboard'
import { findDefaultStickerClassify } from '~/lib/sticker'

import { StickerImg } from './sticker-img'
import { Separator } from './ui/separator'
import { Toaster } from './ui/sonner'
import { toast } from 'sonner'
import { BellIcon, CountdownTimerIcon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { cn } from '~/lib/utils'
import { useLocalStorage } from 'react-use'
import { handleHistorySticker } from '~/lib/strings'

interface StickerCardProps {
  className?: string
  records?: StickerClassify[]
}

export function StickerCard({ className, records = [] }: StickerCardProps) {
  const [active, setActive] = useState<number>(findDefaultStickerClassify(records)?.id ?? 0)
  const [historyStickerRecords, setHistory] = useLocalStorage('sticker-history', {} as Record<number, [number, Sticker]>)

  function addHistory(s: Sticker) {
    if (!historyStickerRecords)
      setHistory({})

    const records = { ...historyStickerRecords }
    records[s.id] = [new Date().getTime(), s]

    setHistory(records)
  }

  async function onCopy(event: MouseEvent<HTMLImageElement>, sticker: Sticker) {
    const img = event.currentTarget

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    const ctx = canvas.getContext('2d')
    ctx?.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      await clipboard.writeBlob(blob)

      toast(`You copied 「${sticker.name}」`, {
        position: 'top-right',
        icon: <BellIcon />,
      })

      addHistory(sticker)
    }, 'image/png')

  }

  // handle history sticker and sort
  const historySticker = handleHistorySticker(historyStickerRecords || {})
  const historyClassify = { id: 0, name: 'History', list: historySticker }

  const stickers = [historyClassify, ...records].find(({ id }) => id === active)

  const stickerNodes = stickers?.list.map((it) => (
    <StickerImg it={it as Sticker} onClick={onCopy} key={it.id} />
  ))

  function classifyBarRenderer(el?: ReactNode) {
    return <>
      <Button
        variant="outline"
        className={cn('w-[40px] h-[40px]', active === 0 ? 'bg-muted' : '')}
        onClick={() => {
          setActive(0)
        }}
      >
        <CountdownTimerIcon />
      </Button>
      {el}</>
  }

  return (
    <Card className={className}>
      <Toaster />
      <CardContent className="overflow-hidden pb-0">
        <ScrollArea className="max-h-[300px] h-52 py-2">
          <div className="grid sm:grid-cols-10 grid-cols-4 gap-1">{stickerNodes}</div>
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="overflow-hidden p-4">
        <ScrollArea className="w-full">
          <StickerClassifyBar
            data={records}
            activeId={active}
            onClick={setActive}
            renderer={classifyBarRenderer}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardFooter>
    </Card>
  )
}

