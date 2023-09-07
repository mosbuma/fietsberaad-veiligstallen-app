/* This type is used when returning parking details to the client                */
/* By adding fields to this structure, it is possible to keep track which fields */
/* from the "old" database are in use                                            */  
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
    Capacity: number,
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
        }[]
  }