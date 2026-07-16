package com.weddingwire.email;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailTemplateRenderer {

    public String render(String template, Map<String, String> variables) {
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }
}
