export interface MediaLink {
  title: string;
  file: {
    url: string;
    stream: string;
    modifiedDatetime: string;
    checksum: string;
  };
  filesize: number;
  trackImage: {
    url: string;
    modifiedDatetime: string;
    checksum: string;
  };
  markers: {
    mepsLanguageSpoken: string;
    mepsLanguageWritten: string;
    documentId: number;
    markers: Array<{
      duration: string;
      startTime: string;
      mepsParagraphId: number;
    }>;
    type: string;
    hash: string;
    introduction: {
      duration: string;
      startTime: string;
    };
  };
  label: string;
  track: number;
  hasTrack: boolean;
  pub: string;
  docid: number;
  booknum: number;
  mimetype: string;
  edition: string;
  editionDescr: string;
  format: string;
  formatDescr: string;
  specialty: string;
  specialtyDescr: string;
  subtitled: boolean;
  frameWidth: number;
  frameHeight: number;
  frameRate: number;
  duration: number;
  bitRate: number;
}

export interface Publication {
  pubName: string;
  parentPubName: string;
  booknum: null | number;
  pub: string;
  issue: string;
  formattedDate: string;
  fileformat: string[];
  track: number | null;
  specialty: string;
  pubImage: {
    url: string;
    modifiedDatetime: string;
    checksum: string;
  };
  languages: {
    [key: string]: {
      name: string;
      direction: string;
      locale: string;
      script: string;
    };
  };
  files: {
    [key: string]: {
      [key: string]: MediaLink[];
    };
  };
}

export interface PublicationFetcher {
  langwritten: string;
  fileformat?: string;
  pub: string;
  issue?: string | number;
  track?: number;
  maxTrack?: number;
}

export interface ImageSizes {
  [key: string]: string;
}

export interface MediaImages {
  [key: string]: ImageSizes;
}
