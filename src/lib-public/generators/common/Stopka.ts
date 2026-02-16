import { Content, ContentColumns } from 'pdfmake/interfaces';
import {
  createHeader,
  createLabelText,
  createSection,
  createSubHeader,
  formatText,
  generateLine,
  generateQRCode,
  generateTwoColumns,
  getContentTable,
  getTable,
  verticalSpacing,
} from '../../../shared/PDF-functions';
import { HeaderDefine } from '../../../shared/types/pdf-types';
import { FormContentState } from '../../../shared/types/additional-data.types';
import { FP, Naglowek, Stopka } from '../../types/fa2.types';
import { Zalacznik } from '../../types/fa3.types';
import { generateZalaczniki } from './Zalaczniki';
import FormatTyp from '../../../shared/enums/common.enum';
import { Informacje, Rejestry } from '../../types/fa1.types';
import { AdditionalDataTypes } from '../../types/common.types';

export function generateStopka(
  additionalData?: AdditionalDataTypes,
  stopka?: Stopka,
  naglowek?: Naglowek,
  wz?: FP[],
  zalacznik?: Zalacznik
): Content[] {
  const wzty: Content[] = generateWZ(wz);
  const rejestry: Content[] = generateRejestry(stopka);
  const informacje: Content[] = generateInformacje(stopka);
  const qrCode: Content[] = generateQRCodeData(additionalData);
  const zalaczniki: Content[] = !additionalData?.isMobile ? generateZalaczniki(zalacznik) : [];

  const result: Content = [
    verticalSpacing(1),
    ...(wzty.length ? [generateLine()] : []),
    ...(wzty.length ? [generateTwoColumns(wzty, [])] : []),
    ...(rejestry.length || informacje.length ? [generateLine()] : []),
    ...rejestry,
    ...informacje,
    ...(zalaczniki.length ? zalaczniki : []),
    { stack: [...qrCode], unbreakable: true },
    createSection(
      [
        {
          stack: createLabelText('Wytworzona w: ', naglowek?.SystemInfo),
          margin: [0, 8, 0, 0],
        },
      ],
      true,
      [0, 0, 0, 0]
    ),
  ];

  return createSection(result, false);
}

function generateWZ(wz?: FP[]): Content[] {
  const result: Content[] = [];
  const definedHeader: HeaderDefine[] = [{ name: '', title: 'Numer WZ', format: FormatTyp.Default }];
  const faWiersze: FP[] = getTable(wz ?? []);
  const content: FormContentState = getContentTable<(typeof faWiersze)[0]>(
    [...definedHeader],
    faWiersze,
    '*'
  );

  if (content.fieldsWithValue.length && content.content) {
    result.push(createSubHeader('Numery dokumentów magazynowych WZ', [0, 8, 0, 4]));
    result.push(content.content);
  }
  return result;
}

function generateRejestry(stopka?: Stopka): Content[] {
  const result: Content[] = [];
  const definedHeader: HeaderDefine[] = [
    { name: 'PelnaNazwa', title: 'Pełna nazwa', format: FormatTyp.Default },
    { name: 'KRS', title: 'KRS', format: FormatTyp.Default },
    { name: 'REGON', title: 'REGON', format: FormatTyp.Default },
    { name: 'BDO', title: 'BDO', format: FormatTyp.Default },
  ];
  const faWiersze: Rejestry[] = getTable(stopka?.Rejestry ?? []);
  const content: FormContentState = getContentTable<(typeof faWiersze)[0]>(
    [...definedHeader],
    faWiersze,
    '*'
  );

  if (content.fieldsWithValue.length && content.content) {
    result.push(createHeader('Rejestry'));
    result.push(content.content);
  }
  return result;
}

function generateInformacje(stopka?: Stopka): Content[] {
  const result: Content[] = [];
  const definedHeader: HeaderDefine[] = [
    { name: 'StopkaFaktury', title: 'Stopka faktury', format: FormatTyp.Default },
  ];
  const faWiersze: Informacje[] = getTable(stopka?.Informacje ?? []);
  const content: FormContentState = getContentTable<(typeof faWiersze)[0]>(
    [...definedHeader],
    faWiersze,
    '*'
  );

  if (content.fieldsWithValue.length && content.content) {
    result.push(createHeader('Pozostałe informacje'));
    result.push(content.content);
  }
  return result;
}

function generateQRCodeData(additionalData?: AdditionalDataTypes): Content[] {
  const result: Content = [];

  if (additionalData?.qrCode) {
    const qrCode = generateQRCode(additionalData.qrCode)!;

    result.push({
      text: formatText('Zeskanuj kod z obrazka lub kliknij w link w jego podpisie', FormatTyp.Value),
      marginTop: 5,
      marginBottom: 5,
    });
    const qrRow: ContentColumns = {
      columns: [
        {
          ...qrCode,
          marginTop: 5,
          width: '50%',
          alignment: 'center',
        },
      ],
    };
    const linkRow: ContentColumns = {
      columns: [
        {
          text: formatText(additionalData.nrKSeF ?? 'OFFLINE', FormatTyp.Default),
          link: additionalData.qrCode,
          marginTop: 5,
          width: '50%',
          alignment: 'center',
        },
      ],
    };

    if (additionalData.qrCode2) {
      qrRow.columns.push({
        ...generateQRCode(additionalData.qrCode2)!,
        marginTop: 5,
        width: '50%',
        alignment: 'center',
      });
      linkRow.columns.push({
        text: formatText('CERTYFIKAT', FormatTyp.Default),
        link: additionalData.qrCode2,
        marginTop: 5,
        width: '50%',
        alignment: 'center',
      });
    }

    result.push(qrRow, linkRow);
  }
  return createSection(result, true);
}
