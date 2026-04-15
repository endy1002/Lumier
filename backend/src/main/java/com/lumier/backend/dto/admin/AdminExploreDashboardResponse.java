package com.lumier.backend.dto.admin;

import java.util.List;

public record AdminExploreDashboardResponse(
  List<AdminProductOptionResponse> products,
  List<AdminAuthorOptionResponse> authors,
  List<AdminAudiobookItemResponse> audiobooks
) {
}
