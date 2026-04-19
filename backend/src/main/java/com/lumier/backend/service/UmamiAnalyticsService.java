package com.lumier.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumier.backend.dto.admin.AdminUmamiAnalyticsResponse;
import com.lumier.backend.dto.admin.AdminUmamiBreakdownItemResponse;
import com.lumier.backend.dto.admin.AdminUmamiTimelinePointResponse;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Service
public class UmamiAnalyticsService {

  private static final String DEFAULT_UMAMI_BASE_URL = "https://api.umami.is/v1";
  private static final int DEFAULT_METRIC_LIMIT = 10;

  private final RestClient restClient;
  private final ObjectMapper objectMapper;
  private final String umamiApiKey;
  private final String umamiWebsiteId;

  private record TimeWindow(long startAt, long endAt, String unit) {}

  public UmamiAnalyticsService(
    ObjectMapper objectMapper,
    @Value("${app.umami.base-url:https://api.umami.is/v1}") String umamiBaseUrl,
    @Value("${app.umami.api-key:}") String umamiApiKey,
    @Value("${app.umami.website-id:}") String umamiWebsiteId
  ) {
    String resolvedBaseUrl = (umamiBaseUrl == null || umamiBaseUrl.isBlank())
      ? DEFAULT_UMAMI_BASE_URL
      : umamiBaseUrl;

    this.restClient = RestClient.builder()
      .baseUrl(resolvedBaseUrl)
      .build();
    this.objectMapper = objectMapper;
    this.umamiApiKey = umamiApiKey;
    this.umamiWebsiteId = umamiWebsiteId;
  }

  public AdminUmamiAnalyticsResponse fetchAnalytics(Integer days, String period, Long customStartAt, Long customEndAt) {
    if (isBlank(umamiApiKey) || isBlank(umamiWebsiteId)) {
      return new AdminUmamiAnalyticsResponse(
        false,
        "Thiếu cấu hình Umami. Cần UMAMI_API_KEY và UMAMI_WEBSITE_ID trong backend env.",
        null,
        null,
        0,
        0,
        0,
        0,
        0,
        null,
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of()
      );
    }

    try {
      TimeWindow window = resolveTimeWindow(days, period, customStartAt, customEndAt);
      long startAt = window.startAt();
      long endAt = window.endAt();
      String unit = window.unit();

      String statsBody = restClient.get()
        .uri(uriBuilder -> uriBuilder
          .path("/websites/{websiteId}/stats")
          .queryParam("startAt", startAt)
          .queryParam("endAt", endAt)
          .build(umamiWebsiteId))
        .header("x-umami-api-key", umamiApiKey)
        .header(HttpHeaders.ACCEPT, "application/json")
        .retrieve()
        .body(String.class);

      String pageviewsBody = restClient.get()
        .uri(uriBuilder -> uriBuilder
          .path("/websites/{websiteId}/pageviews")
          .queryParam("startAt", startAt)
          .queryParam("endAt", endAt)
          .queryParam("unit", unit)
          .queryParam("timezone", "UTC")
          .build(umamiWebsiteId))
        .header("x-umami-api-key", umamiApiKey)
        .header(HttpHeaders.ACCEPT, "application/json")
        .retrieve()
        .body(String.class);

      Map<String, Object> stats = parseJsonToMap(statsBody);
      Map<String, Object> pageviewsData = parseJsonToMap(pageviewsBody);

      long visitors = toLong(stats.get("visitors"));
      long pageviews = toLong(stats.get("pageviews"));
      long visits = toLong(stats.get("visits"));
      long bounces = toLong(stats.get("bounces"));
      long totalTime = toLong(stats.get("totaltime"));
      Double bounceRate = visitors > 0 ? (bounces * 100.0) / visitors : null;

      List<AdminUmamiTimelinePointResponse> timeline = buildTimeline(pageviewsData);
      List<AdminUmamiBreakdownItemResponse> pages = fetchExpandedMetrics(startAt, endAt, "path", DEFAULT_METRIC_LIMIT);
      List<AdminUmamiBreakdownItemResponse> referrers = fetchExpandedMetrics(startAt, endAt, "referrer", DEFAULT_METRIC_LIMIT);
      List<AdminUmamiBreakdownItemResponse> browsers = fetchExpandedMetrics(startAt, endAt, "browser", DEFAULT_METRIC_LIMIT);
      List<AdminUmamiBreakdownItemResponse> operatingSystems = fetchExpandedMetrics(startAt, endAt, "os", DEFAULT_METRIC_LIMIT);
      List<AdminUmamiBreakdownItemResponse> devices = fetchExpandedMetrics(startAt, endAt, "device", DEFAULT_METRIC_LIMIT);
      List<AdminUmamiBreakdownItemResponse> channels = fetchExpandedMetrics(startAt, endAt, "channel", DEFAULT_METRIC_LIMIT);
      List<AdminUmamiBreakdownItemResponse> countries = fetchExpandedMetrics(startAt, endAt, "country", DEFAULT_METRIC_LIMIT);

      return new AdminUmamiAnalyticsResponse(
        true,
        null,
        startAt,
        endAt,
        visitors,
        pageviews,
        visits,
        bounces,
        totalTime,
        bounceRate,
        timeline,
        pages,
        referrers,
        browsers,
        operatingSystems,
        devices,
        channels,
        countries
      );
    } catch (RestClientResponseException ex) {
      TimeWindow fallback = fallbackTimeWindow();
      return new AdminUmamiAnalyticsResponse(
        false,
        "Không thể lấy dữ liệu từ Umami API: " + extractApiError(ex),
        fallback.startAt(),
        fallback.endAt(),
        0,
        0,
        0,
        0,
        0,
        null,
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of()
      );
    } catch (RestClientException ex) {
      TimeWindow fallback = fallbackTimeWindow();
      return new AdminUmamiAnalyticsResponse(
        false,
        "Không thể lấy dữ liệu từ Umami API: " + ex.getMessage(),
        fallback.startAt(),
        fallback.endAt(),
        0,
        0,
        0,
        0,
        0,
        null,
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of()
      );
    } catch (Exception ex) {
      TimeWindow fallback = fallbackTimeWindow();
      return new AdminUmamiAnalyticsResponse(
        false,
        "Không thể xử lý dữ liệu Umami API: " + ex.getMessage(),
        fallback.startAt(),
        fallback.endAt(),
        0,
        0,
        0,
        0,
        0,
        null,
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of()
      );
    }
  }

  private List<AdminUmamiBreakdownItemResponse> fetchExpandedMetrics(long startAt, long endAt, String type, int limit) throws Exception {
    String body = restClient.get()
      .uri(uriBuilder -> uriBuilder
        .path("/websites/{websiteId}/metrics/expanded")
        .queryParam("startAt", startAt)
        .queryParam("endAt", endAt)
        .queryParam("type", type)
        .queryParam("limit", limit)
        .build(umamiWebsiteId))
      .header("x-umami-api-key", umamiApiKey)
      .header(HttpHeaders.ACCEPT, "application/json")
      .retrieve()
      .body(String.class);

    Map<String, Object> payload = parseJsonToMap(body);
    return extractBreakdownRows(payload);
  }

  private TimeWindow resolveTimeWindow(Integer days, String period, Long customStartAt, Long customEndAt) throws Exception {
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    String normalizedPeriod = period == null ? "" : period.trim().toLowerCase();

    if (customStartAt != null && customEndAt != null && customStartAt > 0 && customEndAt > customStartAt) {
      return new TimeWindow(customStartAt, customEndAt, resolveUnitByDuration(customEndAt - customStartAt));
    }

    if (normalizedPeriod.isBlank()) {
      int fallbackDays = normalizeWindowDays(days);
      long endAt = now.toInstant().toEpochMilli();
      long startAt = now.minusDays(fallbackDays).toInstant().toEpochMilli();
      return new TimeWindow(startAt, endAt, fallbackDays <= 1 ? "hour" : "day");
    }

    switch (normalizedPeriod) {
      case "today": {
        LocalDate date = now.toLocalDate();
        long startAt = date.atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli();
        long endAt = now.toInstant().toEpochMilli();
        return new TimeWindow(startAt, endAt, "hour");
      }
      case "last-24-hours": {
        long endAt = now.toInstant().toEpochMilli();
        long startAt = now.minusHours(24).toInstant().toEpochMilli();
        return new TimeWindow(startAt, endAt, "hour");
      }
      case "this-week": {
        LocalDate today = now.toLocalDate();
        int minusDays = today.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue();
        LocalDate weekStart = today.minusDays(Math.max(minusDays, 0));
        long startAt = weekStart.atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli();
        long endAt = now.toInstant().toEpochMilli();
        return new TimeWindow(startAt, endAt, "day");
      }
      case "last-7-days":
        return new TimeWindow(now.minusDays(7).toInstant().toEpochMilli(), now.toInstant().toEpochMilli(), "day");
      case "last-3-days":
        return new TimeWindow(now.minusDays(3).toInstant().toEpochMilli(), now.toInstant().toEpochMilli(), "day");
      case "this-month": {
        LocalDate start = LocalDate.of(now.getYear(), now.getMonth(), 1);
        return new TimeWindow(start.atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli(), now.toInstant().toEpochMilli(), "day");
      }
      case "last-30-days":
        return new TimeWindow(now.minusDays(30).toInstant().toEpochMilli(), now.toInstant().toEpochMilli(), "day");
      case "last-90-days":
        return new TimeWindow(now.minusDays(90).toInstant().toEpochMilli(), now.toInstant().toEpochMilli(), "day");
      case "this-year": {
        LocalDate start = LocalDate.of(now.getYear(), 1, 1);
        return new TimeWindow(start.atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli(), now.toInstant().toEpochMilli(), "month");
      }
      case "last-6-months":
        return new TimeWindow(now.minusMonths(6).toInstant().toEpochMilli(), now.toInstant().toEpochMilli(), "month");
      case "last-12-months":
        return new TimeWindow(now.minusMonths(12).toInstant().toEpochMilli(), now.toInstant().toEpochMilli(), "month");
      case "all-time":
        return resolveAllTimeWindow(now);
      default: {
        int fallbackDays = normalizeWindowDays(days);
        long endAt = now.toInstant().toEpochMilli();
        long startAt = now.minusDays(fallbackDays).toInstant().toEpochMilli();
        return new TimeWindow(startAt, endAt, fallbackDays <= 1 ? "hour" : "day");
      }
    }
  }

  private TimeWindow resolveAllTimeWindow(OffsetDateTime now) throws Exception {
    String body = restClient.get()
      .uri(uriBuilder -> uriBuilder
        .path("/websites/{websiteId}/daterange")
        .build(umamiWebsiteId))
      .header("x-umami-api-key", umamiApiKey)
      .header(HttpHeaders.ACCEPT, "application/json")
      .retrieve()
      .body(String.class);

    Map<String, Object> payload = parseJsonToMap(body);
    Long startAt = parseTimestamp(asString(payload.get("startDate")));
    Long endAt = parseTimestamp(asString(payload.get("endDate")));
    if (startAt == null || endAt == null || startAt >= endAt) {
      return fallbackTimeWindow();
    }

    long durationMs = endAt - startAt;
    if (durationMs <= 30L * 24L * 60L * 60L * 1000L) {
      return new TimeWindow(startAt, endAt, "day");
    }
    if (durationMs <= 2L * 365L * 24L * 60L * 60L * 1000L) {
      return new TimeWindow(startAt, endAt, "month");
    }
    return new TimeWindow(startAt, endAt, "year");
  }

  private TimeWindow fallbackTimeWindow() {
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    return new TimeWindow(now.minusDays(7).toInstant().toEpochMilli(), now.toInstant().toEpochMilli(), "day");
  }

  private String resolveUnitByDuration(long durationMs) {
    long hourMs = 60L * 60L * 1000L;
    long dayMs = 24L * hourMs;
    if (durationMs <= 48L * hourMs) {
      return "hour";
    }
    if (durationMs <= 90L * dayMs) {
      return "day";
    }
    if (durationMs <= 2L * 365L * dayMs) {
      return "month";
    }
    return "year";
  }

  private int normalizeWindowDays(Integer days) {
    if (days == null || days > 1) {
      return 7;
    }

    return 1;
  }

  private String extractApiError(RestClientResponseException ex) {
    try {
      String responseBody = ex.getResponseBodyAsString();
      if (responseBody == null || responseBody.isBlank()) {
        return ex.getMessage();
      }

      JsonNode root = objectMapper.readTree(responseBody);
      if (root.isObject()) {
        String message = root.path("message").asText("");
        if (!message.isBlank()) {
          return message;
        }
      }

      return responseBody;
    } catch (Exception ignored) {
      return ex.getMessage();
    }
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> parseJsonToMap(String rawJson) throws Exception {
    if (rawJson == null || rawJson.isBlank()) {
      return Map.of();
    }

    JsonNode root = objectMapper.readTree(rawJson);
    if (root == null || root.isNull()) {
      return Map.of();
    }

    if (root.isObject()) {
      return objectMapper.convertValue(root, Map.class);
    }

    if (root.isArray()) {
      return Map.of("data", objectMapper.convertValue(root, List.class));
    }

    return Map.of("value", root.asText());
  }

  private List<AdminUmamiTimelinePointResponse> buildTimeline(Map<String, Object> payload) {
    Map<String, Long> pageviewsByTimestamp = new LinkedHashMap<>();
    Map<String, Long> sessionsByTimestamp = new LinkedHashMap<>();

    extractSeries(payload.get("pageviews"), pageviewsByTimestamp);
    extractSeries(payload.get("sessions"), sessionsByTimestamp);

    Map<String, AdminUmamiTimelinePointResponse> merged = new LinkedHashMap<>();

    pageviewsByTimestamp.forEach((ts, value) -> merged.put(ts, new AdminUmamiTimelinePointResponse(
      ts,
      value,
      sessionsByTimestamp.getOrDefault(ts, 0L)
    )));

    sessionsByTimestamp.forEach((ts, value) -> merged.putIfAbsent(ts, new AdminUmamiTimelinePointResponse(
      ts,
      pageviewsByTimestamp.getOrDefault(ts, 0L),
      value
    )));

    return new ArrayList<>(merged.values());
  }

  private List<AdminUmamiBreakdownItemResponse> extractBreakdownRows(Map<String, Object> payload) {
    if (payload == null || payload.isEmpty()) {
      return List.of();
    }

    Object rowsValue = payload.get("data");
    if (!(rowsValue instanceof List<?> rows)) {
      return List.of();
    }

    List<AdminUmamiBreakdownItemResponse> output = new ArrayList<>();
    for (Object rowValue : rows) {
      if (!(rowValue instanceof Map<?, ?> row)) {
        continue;
      }

      String name = asString(row.get("name"));
      if (name.isBlank()) {
        continue;
      }

      output.add(new AdminUmamiBreakdownItemResponse(
        name,
        toLong(row.get("visitors")),
        toLong(row.get("pageviews")),
        toLong(row.get("visits")),
        toLong(row.get("bounces")),
        toLong(row.get("totaltime"))
      ));
    }

    return output;
  }

  private void extractSeries(Object source, Map<String, Long> target) {
    if (!(source instanceof List<?> list)) {
      return;
    }

    for (Object item : list) {
      if (!(item instanceof Map<?, ?> row)) {
        continue;
      }

      String timestamp = String.valueOf(row.get("x"));
      if (timestamp == null || timestamp.isBlank() || "null".equals(timestamp)) {
        continue;
      }

      target.put(timestamp, toLong(row.get("y")));
    }
  }

  private long toLong(Object value) {
    if (value instanceof Number number) {
      return number.longValue();
    }

    try {
      return Long.parseLong(String.valueOf(value));
    } catch (Exception ignored) {
      return 0L;
    }
  }

  private String asString(Object value) {
    return value == null ? "" : String.valueOf(value).trim();
  }

  private Long parseTimestamp(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }

    try {
      return OffsetDateTime.parse(value).toInstant().toEpochMilli();
    } catch (Exception ignored) {
      try {
        return Instant.parse(value).toEpochMilli();
      } catch (Exception ignoredAgain) {
        return null;
      }
    }
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
