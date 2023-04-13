import { FastifyInstance } from "fastify"

interface Caption {
  text: string
  start: number
  end: number
}

interface ExportFileDetails {
  folder: string
  name: string
  format: string
}

const jsonLetra: Caption[] = require("../mock/subtitle.json")

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

  caption.map((line, index) => {
    const string = `${formatTimestampToISO(line.start,false)} --> ${formatTimestampToISO(line.end, false)}\n- ${line.text}\n\n`
    formattedCaption += string
  })
  return formattedCaption
}

const formatCaptionToSRT = (caption: Caption[]) => {
  let formattedCaption = ""
  caption.map((line, index) => {
    const string = `${index + 1}\n${formatTimestampToISO(line.start)} --> ${formatTimestampToISO(line.end)}\n${line.text}\n\n`
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

export async function appRoutes(app: FastifyInstance) {
  app.get("/export", async (request) => {
    const chosenFileFormat = "srt"
    const caption = formatCaption(jsonLetra, chosenFileFormat)

    const exportDetails: ExportFileDetails = {
      folder: "exported",
      name: "caption",
      format: chosenFileFormat,
    }
    generateCaptionFile(caption, exportDetails)
    return caption
  })
}
