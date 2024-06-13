export interface MediaLink {
  bitRate: number;
  booknum: number;
  docid: number;
  duration: number;
  edition: string;
  editionDescr: string;
  file: {
    checksum: string;
    modifiedDatetime: string;
    stream: string;
    url: string;
  };
  filesize: number;
  format: string;
  formatDescr: string;
  frameHeight: number;
  frameRate: number;
  frameWidth: number;
  hasTrack: boolean;
  label: string;
  markers: {
    documentId: number;
    hash: string;
    introduction: {
      duration: string;
      startTime: string;
    };
    markers: Array<{
      duration: string;
      mepsParagraphId: number;
      startTime: string;
    }>;
    mepsLanguageSpoken: string;
    mepsLanguageWritten: string;
    type: string;
  };
  mimetype: string;
  pub: string;
  specialty: string;
  specialtyDescr: string;
  subtitled: boolean;
  subtitles: {
    checksum: string;
    modifiedDatetime: string;
    url: string;
  };
  title: string;
  track: number;
  trackImage: {
    checksum: string;
    modifiedDatetime: string;
    url: string;
  };
}

export interface Publication {
  booknum: null | number;
  fileformat: string[];
  files: {
    [key: string]: {
      [key: string]: MediaLink[];
    };
  };
  formattedDate: string;
  issue: string;
  languages: {
    [key: string]: {
      direction: string;
      locale: string;
      name: string;
      script: string;
    };
  };
  parentPubName: string;
  pub: string;
  pubImage: {
    checksum: string;
    modifiedDatetime: string;
    url: string;
  };
  pubName: string;
  specialty: string;
  track: null | number;
}

export interface PublicationFetcher {
  fileformat?: string;
  issue?: number | string;
  langwritten: string;
  maxTrack?: number;
  pub: string;
  track?: number;
}

export interface ImageSizes {
  [key: string]: string;
}

export interface MediaImages {
  [key: string]: ImageSizes;
}
