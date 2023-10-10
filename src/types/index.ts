/* This type is used when returning parking details to the client                */
/* By adding fields to this structure, it is possible to keep track which fields */
/* from the "old" database are in use                                            */  
export type DayPrefix = 'ma' | 'di' | 'wo' | 'do' | 'vr' | 'za' | 'zo';

export type ParkingDetailsType = {
    ID: string,
    Title: string,
    Location: string,
    Postcode: string,
    Plaats: string,
    Type: string,
    Image: any;
    Open_ma : Date,
    Dicht_ma: Date,
    Open_di : Date,
    Dicht_di: Date,
    Open_wo : Date,
    Dicht_wo: Date,
    Open_do : Date,
    Dicht_do: Date,
    Open_vr : Date,
    Dicht_vr: Date,
    Open_za : Date,
    Dicht_za: Date,
    Open_zo : Date,
    Dicht_zo: Date,
    Openingstijden: string,
    Capacity: number,
    Coordinaten: string,
    FMS: boolean,
    Beheerder: string,
    BeheerderContact: string,
    fietsenstalling_type: {
        id: string,
        name: string,
        sequence: number,
    }[],
    fietsenstalling_secties: {
        titel: string,
        secties_fietstype: // base data for capacity
        {
            Toegestaan: boolean | null,
            Capaciteit: number | null,
            fietstype: {
                Name: string // Assuming Name is of type string
            }
        }[]
    }[],
    abonnementsvorm_fietsenstalling: {
        abonnementsvormen: {
            ID: string,
            naam: string,
            omschrijving: string,
            prijs: string,
            tijdsduur: string,
            conditions: string,
            siteID: string,
            bikeparkTypeID: string,
            isActief: string,
            exploitantSiteID: string,
            idmiddelen: string,
            contractID: string,
            paymentAuthorizationID: string,
            conditionsID: string
        }[]
    },
    exploitant: {
        ID: string,
        Helpdesk: string,
        CompanyName: string,
    },
    fietsenstallingen_services: {
        services: {
            ID: string,
            Name: string
        }

    }
  }