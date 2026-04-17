package com.lumier.backend.dto.admin;

import java.util.List;

public record AdminUmamiAnalyticsResponse(
  boolean configured,
  String message,
  Long startAt,
  Long endAt,
  long visitors,
  long pageviews,
  long visits,
  long bounces,
  long totalTime,
  Double bounceRate,
  List<AdminUmamiTimelinePointResponse> timeline,
  List<AdminUmamiBreakdownItemResponse> pages,
  List<AdminUmamiBreakdownItemResponse> referrers,
  List<AdminUmamiBreakdownItemResponse> browsers,
  List<AdminUmamiBreakdownItemResponse> operatingSystems,
  List<AdminUmamiBreakdownItemResponse> devices,
  List<AdminUmamiBreakdownItemResponse> channels,
  List<AdminUmamiBreakdownItemResponse> countries
) {
}
