import { log } from "console"
import { FastifyInstance, FastifyRequest } from "fastify"

const MOCK: Caption[] = require("../mock/subtitle.json")

const generateCaptionFile = (caption: string, details: ExportFileDetails) => {
  const fs = require("fs")
  const file = `${details.folder}/${details.name}.${details.format}`

  fs.writeFile(file, caption, "utf8", function (err: string) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.")
      return console.log(err)
    }

    console.log(`Caption file has been saved. Path="${file}"`)
  })
}

const formatTimestampToISO = (seconds: number, useReplace: boolean = true) => {
  const convertToIso = new Date(seconds * 1000).toISOString().slice(11, 23)
  return useReplace ? convertToIso.replace(".", ",") : convertToIso
}

const formatCaptionToVTT = (caption: Caption[]) => {
  let formattedCaption = ""

  formattedCaption += "WEBVTT\n\n"

  caption.map((line) => {
    const string = `${formatTimestampToISO(
      line.start,
      false
    )} --> ${formatTimestampToISO(line.end, false)}\n- ${line.text}\n\n`
    formattedCaption += string
  })
  return formattedCaption
}

const formatCaptionToSRT = (caption: Caption[]) => {
  let formattedCaption = ""
  caption.map((line, index) => {
    const string = `${index + 1}\n${formatTimestampToISO(
      line.start
    )} --> ${formatTimestampToISO(line.end)}\n${line.text}\n\n`
    formattedCaption += string
  })

  return formattedCaption
}

const formatCaption = (caption: Caption[], format: string) => {
  let parsedCaption = ""

  switch (format) {
    case "srt":
      parsedCaption = formatCaptionToSRT(caption)
      break
    case "vtt":
      parsedCaption = formatCaptionToVTT(caption)
      break
  }

  return parsedCaption
}

import fs from "fs"

export async function appRoutes(app: FastifyInstance) {
  app.get(
    "/public/:filename",
    async (req: FastifyRequest<{ Params: { filename: string } }>, reply) => {
      const { filename } = req.params
      const fileContent = fs.readFileSync(`public/${filename}`, "utf8")
      reply.type("text/plain").send(fileContent)
    }
  )

  app.post("/export", async (req: FastifyRequest<{ Body: RequestProps }>) => {
    const { captions, fileFormat } = req.body

    const caption = formatCaption(captions, fileFormat)

    const crypto = require("crypto")
    const fileName = crypto.randomUUID()

    const exportDetails: ExportFileDetails = {
      folder: "public",
      name: fileName,
      format: fileFormat,
    }
    generateCaptionFile(caption, exportDetails)

    return `${exportDetails.name}.${exportDetails.format}`
  })
}
