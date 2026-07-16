package com.weddingwire.export;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ExcelExportService {

    public byte[] exportGuests(List<Map<String, String>> guests) {
        return buildExcel("Guest List", guests,
                List.of("Name", "Email", "Phone", "Side", "RSVP Status", "Party Size", "Dietary", "Notes"));
    }

    public byte[] exportChecklist(List<Map<String, String>> items) {
        return buildExcel("Checklist", items,
                List.of("Title", "Description", "Phase", "Due Date", "Completed", "Assigned To"));
    }

    public byte[] exportBudget(List<Map<String, String>> items) {
        return buildExcel("Budget", items,
                List.of("Category", "Description", "Planned Amount", "Actual Amount", "Notes"));
    }

    public byte[] exportVendors(List<Map<String, String>> vendors) {
        return buildExcel("Vendors", vendors,
                List.of("Name", "Category", "Rating", "Price Min", "Price Max", "Status", "Contact Name", "Contact Email", "Contact Phone", "Website", "Notes"));
    }

    public byte[] exportCrew(List<Map<String, String>> crew) {
        return buildExcel("Wedding Crew", crew,
                List.of("Name", "Role", "Email", "Phone", "External", "Notes"));
    }

    public byte[] exportTimeline(List<Map<String, String>> items) {
        return buildExcel("Timeline", items,
                List.of("Time", "End Time", "Title", "Description", "Assigned To", "Public"));
    }

    private byte[] buildExcel(String sheetName, List<Map<String, String>> data, List<String> headers) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BROWN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            int rowNum = 1;
            for (Map<String, String> row : data) {
                Row excelRow = sheet.createRow(rowNum++);
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = excelRow.createCell(i);
                    cell.setCellValue(row.getOrDefault(headers.get(i), ""));
                    cell.setCellStyle(dataStyle);
                }
            }

            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }
}
