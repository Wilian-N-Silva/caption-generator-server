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

type RequestProps = {
  fileFormat: string
  captions: Caption[]
}
