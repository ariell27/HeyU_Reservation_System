/**
 * 时间槽工具函数（后端版本）
 * 统一管理时间槽生成和验证逻辑
 */

import { readBookings } from './bookingUtils.js';
import { readBlockedDates } from './blockedDatesUtils.js';

// 从服务时长字符串中提取小时数
export const parseDuration = (duration) => {
  if (!duration) return 3; // 默认3小时
  const match = duration.match(/(\d+)\s*小时/);
  return match ? parseInt(match[1], 10) : 3;
};

// 根据日期获取营业结束时间
export const getEndHour = (date) => {
  if (!date) return 19; // 默认19:00
  const dayOfWeek = new Date(date).getDay(); // 0 = 周日, 1 = 周一, 2 = 周二, 3 = 周三, 4 = 周四, 5 = 周五, 6 = 周六
  // 周二和周四：22:00，其他日期：19:00
  return dayOfWeek === 2 || dayOfWeek === 4 ? 22 : 19;
};

// 检查时间段是否有足够的时长完成服务
export const isTimeSlotValid = (time, serviceDuration, endHour) => {
  const [hours] = time.split(":").map(Number);
  // 检查开始时间加上服务时长是否超过营业结束时间
  return hours + serviceDuration <= endHour;
};

// 判断是否为周二/周四18:00之后
export const isEveningTime = (time, date) => {
  if (!date) return false;
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek !== 2 && dayOfWeek !== 4) return false; // 不是周二或周四
  const [hours] = time.split(":").map(Number);
  return hours >= 18; // 18:00及之后
};

// 检查时间槽是否与已预订冲突
export const isTimeSlotBooked = (time, bookings, serviceDuration) => {
  if (!bookings || bookings.length === 0) return false;

  const [timeHours] = time.split(":").map(Number);
  const timeEnd = timeHours + serviceDuration;

  return bookings.some((booking) => {
    const bookingTime = booking.selectedTime || booking.time || booking.startTime;
    if (!bookingTime) return false;

    const [bookingStartHours] = bookingTime.split(":").map(Number);
    const bookingDuration = booking.service?.duration
      ? parseDuration(booking.service.duration)
      : parseDuration(booking.duration) || 3;
    const bookingEnd = bookingStartHours + bookingDuration;

    // 冲突条件：时间槽开始时间 < 预订结束时间 且 时间槽开始时间 + 服务时长 > 预订开始时间
    return timeHours < bookingEnd && timeEnd > bookingStartHours;
  });
};

// 检查时间槽是否被 block
export const isTimeSlotBlocked = (time, date, blockedDates) => {
  if (!date || !blockedDates || blockedDates.length === 0) return false;

  const dateStr = typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split("T")[0];
  const blockedDate = blockedDates.find((bd) => bd.date === dateStr);

  if (!blockedDate) return false;

  // 如果 times 数组为空，表示整个日期被 block
  if (!blockedDate.times || blockedDate.times.length === 0) {
    return true;
  }

  // 检查特定时间段是否被 block
  return blockedDate.times.includes(time);
};

/**
 * 生成默认时间槽
 * 默认时间槽：["09:00", "12:00", "15:00"]
 * 周二/周四还会包含 "18:00"
 */
export const generateDefaultTimeSlots = (date = null) => {
  const defaultSlots = ["09:00", "12:00", "15:00"];

  // 如果是周二或周四，添加18:00
  if (date) {
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      // 周二或周四
      defaultSlots.push("18:00");
    }
  }

  return defaultSlots;
};

/**
 * 生成可用时间槽（考虑预订和 block）
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 * @param {Object} service - 服务对象
 * @returns {Array<string>} 可用时间槽数组
 */
export const generateAvailableTimeSlots = (date, service) => {
  // 读取预订和 blocked dates
  const allBookings = readBookings();
  const blockedDates = readBlockedDates();

  // 筛选指定日期的预订
  const dateStr = typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split("T")[0];
  const bookings = allBookings.filter((booking) => {
    const bookingDateStr = new Date(booking.selectedDate).toISOString().split("T")[0];
    return bookingDateStr === dateStr;
  });

  const slotsSet = new Set(); // 使用Set去重
  const endHour = getEndHour(date); // 根据日期获取结束时间

  if (!service) {
    // 如果没有选择服务，返回空数组
    return [];
  }

  // 检查整个日期是否被 block
  if (isTimeSlotBlocked("00:00", date, blockedDates)) {
    return [];
  }

  const serviceDuration = parseDuration(service.duration);
  const defaultSlots = ["09:00", "12:00", "15:00"];

  // 1. 如果没有预订，返回默认时间槽
  if (!bookings || bookings.length === 0) {
    defaultSlots.forEach((time) => {
      if (
        isTimeSlotValid(time, serviceDuration, endHour) &&
        !isTimeSlotBlocked(time, date, blockedDates)
      ) {
        slotsSet.add(time);
      }
    });

    // 周二/周四添加18:00（如果服务是3小时）
    if (date) {
      const dayOfWeek = new Date(date).getDay();
      if ((dayOfWeek === 2 || dayOfWeek === 4) && serviceDuration === 3) {
        if (
          isTimeSlotValid("18:00", serviceDuration, endHour) &&
          !isTimeSlotBlocked("18:00", date, blockedDates)
        ) {
          slotsSet.add("18:00");
        }
      }
    }

    const slots = Array.from(slotsSet).sort();
    return slots;
  }

  // 2. 如果有预订，动态计算可用时间槽
  // 2.1 添加默认时间槽（如果有效且不与预订冲突且不被 block）
  defaultSlots.forEach((time) => {
    if (
      isTimeSlotValid(time, serviceDuration, endHour) &&
      !isTimeSlotBooked(time, bookings, serviceDuration) &&
      !isTimeSlotBlocked(time, date, blockedDates)
    ) {
      slotsSet.add(time);
    }
  });

  // 2.2 周二/周四添加18:00（如果服务是3小时且不与预订冲突且不被 block）
  if (date) {
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      if (
        serviceDuration === 3 &&
        isTimeSlotValid("18:00", serviceDuration, endHour) &&
        !isTimeSlotBooked("18:00", bookings, serviceDuration) &&
        !isTimeSlotBlocked("18:00", date, blockedDates)
      ) {
        slotsSet.add("18:00");
      }
    }
  }

  // 2.3 对于每个预订，计算上一个和下一个可用时间
  bookings.forEach((booking) => {
    const bookingTime = booking.selectedTime || booking.time || booking.startTime;
    if (!bookingTime) return; // 如果没有时间，跳过这个预订

    const [bookingStartHours] = bookingTime.split(":").map(Number);
    const bookingDuration = booking.service?.duration
      ? parseDuration(booking.service.duration)
      : parseDuration(booking.duration) || 3;
    const bookingEnd = bookingStartHours + bookingDuration;

    // 计算上一个可用时间：从默认时间槽中找到满足条件的
    defaultSlots.forEach((defaultTime) => {
      const [defaultHours] = defaultTime.split(":").map(Number);
      // 上一个可用时间条件：defaultTime + serviceDuration <= bookingStartHours
      if (defaultHours + serviceDuration <= bookingStartHours) {
        if (
          isTimeSlotValid(defaultTime, serviceDuration, endHour) &&
          !isTimeSlotBooked(defaultTime, bookings, serviceDuration) &&
          !isTimeSlotBlocked(defaultTime, date, blockedDates)
        ) {
          slotsSet.add(defaultTime);
        }
      }
    });

    // 计算下一个可用时间：预订结束时间
    const nextAvailableTime = `${bookingEnd.toString().padStart(2, "0")}:00`;
    if (
      isTimeSlotValid(nextAvailableTime, serviceDuration, endHour) &&
      !isTimeSlotBooked(nextAvailableTime, bookings, serviceDuration) &&
      !isTimeSlotBlocked(nextAvailableTime, date, blockedDates)
    ) {
      // 检查是否为周二/周四晚上（18:00之后），如果是且服务是5小时，则不添加
      if (!(isEveningTime(nextAvailableTime, date) && serviceDuration === 5)) {
        slotsSet.add(nextAvailableTime);
      }
    }

    // 也检查默认时间槽中是否有在预订结束后的
    defaultSlots.forEach((defaultTime) => {
      const [defaultHours] = defaultTime.split(":").map(Number);
      // 下一个可用时间条件：defaultTime >= bookingEnd
      if (defaultHours >= bookingEnd) {
        if (
          isTimeSlotValid(defaultTime, serviceDuration, endHour) &&
          !isTimeSlotBooked(defaultTime, bookings, serviceDuration) &&
          !isTimeSlotBlocked(defaultTime, date, blockedDates)
        ) {
          slotsSet.add(defaultTime);
        }
      }
    });
  });

  // 2.4 过滤冲突：移除与预订冲突或被 block 的时间槽
  const finalSlots = Array.from(slotsSet).filter((time) => {
    // 检查是否被 block
    if (isTimeSlotBlocked(time, date, blockedDates)) {
      return false;
    }

    // 检查是否与预订冲突
    if (isTimeSlotBooked(time, bookings, serviceDuration)) {
      return false;
    }

    // 检查是否为周二/周四晚上（18:00之后），如果是且服务是5小时，则不显示
    if (isEveningTime(time, date) && serviceDuration === 5) {
      return false;
    }

    // 检查是否有足够的时长
    return isTimeSlotValid(time, serviceDuration, endHour);
  });

  // 转换为数组并排序
  return finalSlots.sort();
};

