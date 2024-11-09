import { prisma } from "~/server/db";

class ReportsUtil {
    public async getZipID(councilId: string): Promise<string | null> {
        const contact = await prisma.contacts.findUnique({
            where: { ID: councilId },
            select: { ZipID: true },
        });
        return contact?.ZipID || null;
    }

    public async getFirstTransactionDate(zipID: string): Promise<Date | null> {
        const transaction = await prisma.transacties.findFirst({
            where: { ZipID: zipID },
            orderBy: { Date_checkout: 'asc' },
            select: { Date_checkout: true },
        });

        const occupation = await prisma.bezettingsdata.findFirst({
            where: { bikeparkID: { startsWith: zipID } },
            orderBy: { timestamp: 'asc' },
            select: { timestamp: true },
        });

        const firstTransactionDate = transaction?.Date_checkout;
        const firstOccupationDate = occupation?.timestamp;

        if (!firstTransactionDate) return firstOccupationDate||null;
        if (!firstOccupationDate) return firstTransactionDate||null;

        return new Date(Math.min(firstTransactionDate.getTime(), firstOccupationDate.getTime()));
    }
}

export default ReportsUtil;