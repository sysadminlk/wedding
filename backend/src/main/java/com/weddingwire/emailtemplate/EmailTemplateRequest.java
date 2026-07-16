package com.weddingwire.emailtemplate;

import lombok.Data;

@Data
public class EmailTemplateRequest {
    private String subject;
    private String bodyHtml;
}
