import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { PurchaseOrderDetail } from "@/types/purchase-order";

const formatCurrency = (value: number | string) =>
  `Rp${Number(value ?? 0)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingVertical: 36,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
  },
  logo: {
    width: 160,
    height: 56,
    objectFit: "contain",
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 2,
  },
  titleBox: {
    marginLeft: "auto",
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  docSubtitle: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 2,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 24,
  },
  infoCard: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    width: "48%",
  },
  infoLabel: {
    fontSize: 7.5,
    color: "#94a3b8",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  infoSub: {
    fontSize: 9,
    color: "#334155",
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#fef3c7",
    color: "#b45309",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 9.5,
    color: "#1e293b",
  },
  colNo: { width: "5%" },
  colCode: { width: "13%" },
  colName: { width: "34%", paddingRight: 6 },
  colQty: { width: "13%", textAlign: "center" },
  colPrice: { width: "17%", textAlign: "right" },
  colSubtotal: {
    width: "18%",
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
  },
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "#ecfdf5",
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
  },
  footerLabel: {
    width: "65%",
  },
  footerTotal: {
    width: "35%",
    textAlign: "right",
  },
  itemUnitSub: {
    color: "#94a3b8",
    fontSize: 8,
  },
  notesSection: {
    marginTop: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },
  notesTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  notesText: {
    fontSize: 9.5,
    color: "#334155",
    lineHeight: 1.4,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 34,
    paddingHorizontal: 12,
  },
  signatureCol: {
    width: "40%",
    alignItems: "center",
  },
  signatureRole: {
    fontSize: 9.5,
    color: "#334155",
  },
  signatureSpace: {
    height: 52,
  },
  signatureLine: {
    width: 160,
    borderTopWidth: 1,
    borderTopColor: "#94a3b8",
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#94a3b8",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
});

interface SPDocumentProps {
  po: PurchaseOrderDetail;
}

export function SPDocument({ po }: SPDocumentProps) {
  return (
    <Document
      title={`Surat Pesanan ${po.poNumber}`}
      author="ApotekIn"
      creator="ApotekIn"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            src={`${window.location.origin}/images/logo.png`}
            style={styles.logo}
          />
          <View style={styles.titleBox}>
            <Text style={styles.docTitle}>SURAT PESANAN (SP)</Text>
            <Text style={styles.docSubtitle}>{po.poNumber}</Text>
          </View>
        </View>

        <View style={styles.metaSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Kepada Yth.</Text>
            <Text style={styles.infoValue}>{po.supplier.name}</Text>
            <Text style={styles.infoSub}>
              Kode Supplier: {po.supplier.code}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Informasi Pesanan</Text>
            <Text style={styles.infoValue}>{po.poNumber}</Text>
            <Text style={styles.infoSub}>
              Tanggal PO: {formatDate(po.createdAt)}
            </Text>
            <Text style={styles.infoSub}>
              Dibuat oleh: {po.createdBy?.fullName ?? "-"}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>No</Text>
            <Text style={styles.colCode}>Kode</Text>
            <Text style={styles.colName}>Nama Barang</Text>
            <Text style={styles.colQty}>Qty Order</Text>
            <Text style={styles.colPrice}>Harga Satuan</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>

          {po.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow} wrap={false}>
              <Text style={styles.colNo}>{index + 1}</Text>
              <Text style={styles.colCode}>{item.item.code}</Text>
              <Text style={styles.colName}>
                {item.item.name}
                {"\n"}
                <Text style={styles.itemUnitSub}>{item.item.unit}</Text>
              </Text>
              <Text style={styles.colQty}>
                {item.orderedQty} {item.item.unit}
              </Text>
              <Text style={styles.colPrice}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.colSubtotal}>
                {formatCurrency(item.receivedQty * Number(item.unitPrice ?? 0))}
              </Text>
            </View>
          ))}

          <View style={styles.tableFooter} wrap={false}>
            <Text style={styles.footerLabel}>
              Total ({po.items.length} item dipesan)
            </Text>
            <Text style={styles.footerTotal}>
              {formatCurrency(po.totalAmount)}
            </Text>
          </View>
        </View>

        {po.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Catatan</Text>
            <Text style={styles.notesText}>{po.notes}</Text>
          </View>
        ) : null}

        <View style={styles.signatureSection}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureRole}>Pemesan,</Text>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>
              {po.createdBy?.fullName ?? "ApotekIn"}
            </Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureRole}>Hormat Kami,</Text>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{po.supplier.name}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            Dicetak dari ApotekIn pada{" "}
            {new Date().toLocaleString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} dari ${totalPages}`
            }
            fixed
          />
        </View>
      </Page>
    </Document>
  );
}
