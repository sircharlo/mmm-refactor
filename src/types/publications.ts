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
  title: string;
  track: number;
  trackImage: {
    checksum: string;
    modifiedDatetime: string;
    url: string;
  };
}

export interface MediaItemsMediatorFile {
  bitRate: number;
  checksum: string;
  duration: number;
  filesize: number;
  frameHeight: number;
  frameRate: number;
  frameWidth: number;
  label: string;
  mimetype: string;
  modifiedDatetime: string;
  progressiveDownloadURL: string;
  subtitled: boolean;
  subtitles: {
    checksum: string;
    modifiedDatetime: string;
    url: string;
  };
}

export interface MediaItemsMediator {
  media: {
    availableLanguages: string[];
    description: string;
    duration: number;
    durationFormattedHHMM: string;
    durationFormattedMinSec: string;
    files: MediaItemsMediatorFile[];
    firstPublished: string;
    guid: string;
    images: {
      lsr: {
        lg: string;
        md: string;
        sm: string;
        xl: string;
      };
      pnr: {
        lg: string;
        md: string;
        sm: string;
        xl: string;
      };
      sqr: {
        lg: string;
        md: string;
        sm: string;
        xl: string;
      };
      wss: {
        lg: string;
        md: string;
        sm: string;
        xl: string;
      };
    };
    languageAgnosticNaturalKey: string;
    naturalKey: string;
    primaryCategory: string;
    printReferences: string[];
    tags: string[];
    title: string;
    type: string;
  }[];
}

/**
   * // 20240614125438
// https://b.jw-cdn.org/apis/mediator/v1/media-items/U/pub-lmdv_6_VIDEO

{
  "media": [
    {

      "images": {
        "pnr": {
          "lg": "https://cms-imgp.jw-cdn.org/img/p/1102023306/univ/art/1102023306_univ_pnr_lg.jpg"
        },
        "wss": {
          "lg": "https://cms-imgp.jw-cdn.org/img/p/1102023306/univ/art/1102023306_univ_wss_lg.jpg",
          "sm": "https://cms-imgp.jw-cdn.org/img/p/1102023306/univ/art/1102023306_univ_wss_sm.jpg"
        },
        "lsr": {
          "xl": "https://cms-imgp.jw-cdn.org/img/p/1102023306/univ/art/1102023306_univ_lsr_xl.jpg"
        },
        "sqr": {
          "md": "https://cms-imgp.jw-cdn.org/img/p/1102023306/univ/art/1102023306_univ_sqr_md.jpg"
        }
      },
      "availableLanguages": [
        "A",
        "AA",

      ],
      "printReferences": [
        "lmdv-6.v",
        "lmdv-6"
      ]
    }
  ],
  "language": {
    "languageCode": "U",
    "locale": "ru",
    "script": "CYRILLIC",
    "direction": "ltr",
    "isSignLanguage": false
  }
}
   */

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
