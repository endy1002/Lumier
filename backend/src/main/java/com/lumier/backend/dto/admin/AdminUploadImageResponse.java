package com.lumier.backend.dto.admin;

public record AdminUploadImageResponse(
  String url,
  String fileName,
  long size
) {
}
