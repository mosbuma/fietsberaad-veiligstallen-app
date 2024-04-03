import React, { useState, useEffect } from "react";
import type { ParkingDetailsType, DayPrefix } from "~/types/";

import SectionBlock from "~/components/SectionBlock";
import HorizontalDivider from "~/components/HorizontalDivider";
import FormInput from "~/components/Form/FormInput";
import FormTextArea from "~/components/Form/FormTextArea";
import FormCheckbox from "~/components/Form/FormCheckbox";

type OpeningDetailsType = {
  Open_ma: Date,
  Dicht_ma: Date,
  Open_di: Date,
  Dicht_di: Date,
  Open_wo: Date,
  Dicht_wo: Date,
  Open_do: Date,
  Dicht_do: Date,
  Open_vr: Date,
  Dicht_vr: Date,
  Open_za: Date,
  Dicht_za: Date,
  Open_zo: Date,
  Dicht_zo: Date,
}

export type OpeningChangedType = {
  [key: string]: Date
}

const getOpenTimeKey = (day: DayPrefix): keyof OpeningDetailsType => {
  return ('Open_' + day) as keyof OpeningDetailsType;
}

const getDichtTimeKey = (day: DayPrefix): keyof OpeningDetailsType => {
  return ('Dicht_' + day) as keyof OpeningDetailsType;
}

const formatOpeningTimesForEdit = (
  parkingdata: OpeningDetailsType,
  day: DayPrefix,
  label: string,
  handlerChange: Function,
  handlerChangeChecks: Function,
): React.ReactNode => {
  const wkday = new Date().getDay();

  const tmpopen: Date = new Date(parkingdata[getOpenTimeKey(day)]);
  const hoursopen = tmpopen.getHours() - 1;//TODO
  const minutesopen = String(tmpopen.getMinutes()).padStart(2, "0");

  const tmpclose: Date = new Date(parkingdata[getDichtTimeKey(day)]);
  const hoursclose = tmpclose.getHours() - 1;//TODO
  const minutesclose = String(tmpclose.getMinutes()).padStart(2, "0");

  let value = `${hoursopen}:${minutesopen} - ${hoursclose}:${minutesclose}`;

  let diff = Math.abs((tmpclose.getTime() - tmpopen.getTime()) / 1000);
  if (diff >= 86340) {
    value = '24h'
  } else if (diff === 0) {
    value = 'gesloten'
  }

  const showtimes = diff > 0 && diff < 86340;
  return (
    <tr className="h-14">
      <td>{label}</td>
      <td>
        <FormCheckbox key={"cb-" + day} checked={diff >= 86340} onChange={handlerChangeChecks(day, true)}>
          24h
        </FormCheckbox>
      </td>
      <td>
        <FormCheckbox key={"cb-" + day} checked={diff === 0} onChange={handlerChangeChecks(day, false)}>
          gesloten
        </FormCheckbox>
      </td>
      <td>
        {showtimes ?
          <div className="flex flex-row">
            <FormInput
              type="number"
              value={hoursopen}
              style={{ width: '80px', borderRadius: '10px 0 0 10px', textAlign: 'right' }}
              onChange={handlerChange(day, true, true)}
            />
            <FormInput
              type="number"
              value={minutesopen}
              style={{ width: '80px', borderRadius: '0 10px 10px 0' }}
              onChange={handlerChange(day, true, false)}
            />
          </div>
          :
          null}
      </td>
      <td>
        {showtimes ? 't/m' : ''}
      </td>
      <td>
        {showtimes ?
          <div className="flex flex-row">
            <FormInput
              type="number"
              value={hoursclose}
              size={4}
              style={{ width: '80px', borderRadius: '10px 0 0 10px', textAlign: 'right' }}
              onChange={handlerChange(day, false, true)}
            />
            <FormInput
              type="number"
              value={minutesclose}
              size={4}
              style={{ width: '80px', borderRadius: '0 10px 10px 0' }}
              onChange={handlerChange(day, false, false)}
            />
          </div>
          :
          null}
      </td>
      <td className="px-10">[{value}]</td>
    </tr>
  );
};

const extractParkingFields = (parkingdata: ParkingDetailsType): OpeningDetailsType => {
  return {
    Open_ma: parkingdata.Open_ma,
    Dicht_ma: parkingdata.Dicht_ma,
    Open_di: parkingdata.Open_di,
    Dicht_di: parkingdata.Dicht_di,
    Open_wo: parkingdata.Open_wo,
    Dicht_wo: parkingdata.Dicht_wo,
    Open_do: parkingdata.Open_do,
    Dicht_do: parkingdata.Dicht_do,
    Open_vr: parkingdata.Open_vr,
    Dicht_vr: parkingdata.Dicht_vr,
    Open_za: parkingdata.Open_za,
    Dicht_za: parkingdata.Dicht_za,
    Open_zo: parkingdata.Open_zo,
    Dicht_zo: parkingdata.Dicht_zo,
  }
}

const setHourInDate = (date: Date, newHour: number): Date => {
  if (newHour < 0 || newHour >= 24) {
    throw new Error('Invalid hour value. Hour should be between 0 and 23.');
  }

  const newDate = new Date(date);
  newDate.setHours(newHour);
  return newDate;
};

const setMinutesInDate = (date: Date, newMinutes: number): Date => {
  if (newMinutes < 0 || newMinutes >= 60) {
    throw new Error('Invalid minutes value. Minutes should be between 0 and 59.');
  }

  const newDate = new Date(date);
  newDate.setMinutes(newMinutes);
  return newDate;
};

const ParkingEditOpening = ({ parkingdata, openingChanged }: { parkingdata: any, openingChanged: Function }) => {
  const startValues = extractParkingFields(parkingdata);
  const [changes, setChanges] = useState<OpeningChangedType>({});
  const [openingstijden, setOpeningstijden] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (Object.keys(changes).length > 0) {
      openingChanged(changes, openingstijden);
    } else {
      openingChanged(undefined, openingstijden);
    }
  }, [changes, openingstijden]);

  // Function that runs if the capacity changes
  const handleChange = (day: DayPrefix, isOpeningTime: boolean, isHoursField: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const key = isOpeningTime ? getOpenTimeKey(day) : getDichtTimeKey(day);
    // determine new time

    // let oldtime: Date = new Date((key in currentValues) ? currentValues[key]: startValues[key]);
    let oldtime: Date = new Date((key in changes) ? changes[key] as Date : startValues[key]);
    let newtime = undefined;

    const newval: number = Number(e.target.value);
    if (isHoursField) {
      if (newval < 0 || newval > 23) {
        return; // invalid value
      }

      newtime = setHourInDate(oldtime, newval);
    } else {
      if (newval < 0 || newval > 59) {
        return; // invalid value
      }

      newtime = setMinutesInDate(oldtime, newval);
    }

    // setCurrentValues({...currentValues, [key]: newtime.toString()});
    setChanges({ ...changes, [key]: newtime });
  }

  // Function that runs if the active state changes
  const handleChangeChecks = (day: DayPrefix, is24hourscheck: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const openkey = getOpenTimeKey(day)
    const dichtkey = getDichtTimeKey(day);

    if (e.target.checked) {
      const newopen = new Date(0);

      // add 24 hours for full day open, otherwise 0 for full day closed
      const newdicht = new Date(is24hourscheck ? (86340 * 1000) : 0);

      setChanges({ ...changes, [openkey]: newopen, [dichtkey]: newdicht });
    } else {
      const newopen = setHourInDate(new Date(0), 10);
      const newdicht = setHourInDate(new Date(0), 17);

      setChanges({ ...changes, [openkey]: newopen, [dichtkey]: newdicht });
    }
  }

  // Function that runs if extra description field changes
  const handleChangeOpeningstijden = () => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value === parkingdata.Openingstijden) {
      setOpeningstijden(undefined);
    } else {
      setOpeningstijden(e.target.value);
    }
  }

  const data = Object.assign(
    { ...startValues },
    { ...changes }
  );

  return (
    <div className="flex flex-col">
      <SectionBlock
        heading="Openingstijden"
      >
        <table className="w-full">
          <tbody>
            {formatOpeningTimesForEdit(data, "ma", "Maandag", handleChange, handleChangeChecks)}
            {formatOpeningTimesForEdit(data, "di", "Dinsdag", handleChange, handleChangeChecks)}
            {formatOpeningTimesForEdit(data, "wo", "Woensdag", handleChange, handleChangeChecks)}
            {formatOpeningTimesForEdit(data, "do", "Donderdag", handleChange, handleChangeChecks)}
            {formatOpeningTimesForEdit(data, "vr", "Vrijdag", handleChange, handleChangeChecks)}
            {formatOpeningTimesForEdit(data, "za", "Zaterdag", handleChange, handleChangeChecks)}
            {formatOpeningTimesForEdit(data, "zo", "Zondag", handleChange, handleChangeChecks)}
          </tbody>
        </table>
      </SectionBlock>
      <HorizontalDivider className="my-4" />
      <SectionBlock
        heading="Afwijkende Openingstijden"
        contentClasses="w-full">
        <FormTextArea
          value={undefined === openingstijden ? (parkingdata.Openingstijden !== null ? parkingdata.Openingstijden.replaceAll("<br />", "\n") : '') : openingstijden}
          style={{ width: '100%', borderRadius: '0 10px 10px 0' }}
          className="w-full"
          onChange={handleChangeOpeningstijden()}
          rows={10}
        />
      </SectionBlock>
    </div>
  );
};

export default ParkingEditOpening;
