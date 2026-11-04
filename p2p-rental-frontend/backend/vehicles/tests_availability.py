import datetime
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from decimal import Decimal

from vehicles.models import Vehicle, Availability
from vehicles.availability_service import AvailabilityService

User = get_user_model()

class AvailabilityServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='host@test.com', username='host', password='password', roles=['OWNER'])
        self.vehicle = Vehicle.objects.create(
            owner=self.user,
            make='Tesla',
            model='Model 3',
            year=2022,
            vehicle_type='Sedan',
            registration_number='TEST-123',
            fuel_type='Electric',
            transmission='Automatic',
            seats=5,
            location='San Francisco',
            price_per_day=Decimal('100.00'),
            status='APPROVED'
        )
        # Utility datetimes (UTC)
        self.now = timezone.now().replace(microsecond=0)
        self.day1_start = self.now + datetime.timedelta(days=1)
        self.day1_end = self.day1_start + datetime.timedelta(hours=24)
        
        self.day2_start = self.day1_end
        self.day2_end = self.day2_start + datetime.timedelta(hours=24)
        
        self.day3_start = self.day2_end
        self.day3_end = self.day3_start + datetime.timedelta(hours=24)

    def test_same_day_no_overlap(self):
        # Block morning
        AvailabilityService.block_dates(self.vehicle, self.day1_start, self.day1_start + datetime.timedelta(hours=12))
        
        # Check afternoon
        is_avail = AvailabilityService.is_available(
            self.vehicle, 
            self.day1_start + datetime.timedelta(hours=12), 
            self.day1_end
        )
        self.assertTrue(is_avail)

    def test_adjacent_days(self):
        # Book day 1
        AvailabilityService.block_dates(self.vehicle, self.day1_start, self.day1_end, status=Availability.Status.BOOKED)
        
        # Check day 2
        is_avail = AvailabilityService.is_available(self.vehicle, self.day2_start, self.day2_end)
        self.assertTrue(is_avail, "Adjacent days should not overlap if end == start")

    def test_partial_overlap(self):
        AvailabilityService.block_dates(self.vehicle, self.day1_start, self.day2_end) # spans 48 hours
        
        # Overlaps on the left
        left_overlap = AvailabilityService.is_available(
            self.vehicle,
            self.day1_start - datetime.timedelta(hours=12),
            self.day1_start + datetime.timedelta(hours=12)
        )
        self.assertFalse(left_overlap)
        
        # Overlaps on the right
        right_overlap = AvailabilityService.is_available(
            self.vehicle,
            self.day2_end - datetime.timedelta(hours=12),
            self.day3_end
        )
        self.assertFalse(right_overlap)

    def test_complete_overlap(self):
        AvailabilityService.block_dates(self.vehicle, self.day1_start, self.day1_end)
        
        # Querying entirely within the block
        is_avail = AvailabilityService.is_available(
            self.vehicle,
            self.day1_start + datetime.timedelta(hours=2),
            self.day1_end - datetime.timedelta(hours=2)
        )
        self.assertFalse(is_avail)
        
        # Querying entirely encapsulating the block
        is_avail2 = AvailabilityService.is_available(
            self.vehicle,
            self.day1_start - datetime.timedelta(hours=2),
            self.day1_end + datetime.timedelta(hours=2)
        )
        self.assertFalse(is_avail2)

    def test_booking_inside_blocked_range(self):
        # Host blocks entire week
        AvailabilityService.block_dates(self.vehicle, self.day1_start, self.day1_start + datetime.timedelta(days=7))
        
        # Attempt to book inside the block
        with self.assertRaises(ValueError):
            AvailabilityService.block_dates(
                self.vehicle, 
                self.day1_start + datetime.timedelta(days=1), 
                self.day1_start + datetime.timedelta(days=2),
                status=Availability.Status.BOOKED
            )

    def test_block_overlapping_booking(self):
        # Booking exists
        AvailabilityService.block_dates(
            self.vehicle, 
            self.day1_start, 
            self.day1_end,
            status=Availability.Status.BOOKED
        )
        
        # Host tries to block over it (CRITICAL REQUIREMENT)
        with self.assertRaises(ValueError):
            AvailabilityService.block_dates(
                self.vehicle,
                self.day1_start - datetime.timedelta(hours=2),
                self.day1_start + datetime.timedelta(hours=2),
                status=Availability.Status.BLOCKED
            )

    def test_multiple_bookings(self):
        # Book day 1 and day 3
        AvailabilityService.block_dates(self.vehicle, self.day1_start, self.day1_end, status=Availability.Status.BOOKED)
        AvailabilityService.block_dates(self.vehicle, self.day3_start, self.day3_end, status=Availability.Status.BOOKED)
        
        # Day 2 should be available
        is_avail = AvailabilityService.is_available(self.vehicle, self.day2_start, self.day2_end)
        self.assertTrue(is_avail)
        
        # Spanning day 1 to day 3 should NOT be available
        is_avail_span = AvailabilityService.is_available(self.vehicle, self.day1_start, self.day3_end)
        self.assertFalse(is_avail_span)

    def test_timezone_handling(self):
        # Ensure UTC and local times are compared safely by Django's DB
        utc_time = datetime.datetime(2026, 11, 1, 12, 0, tzinfo=datetime.timezone.utc)
        ny_tz = datetime.timezone(datetime.timedelta(hours=-4))
        # Equivalent to 12:00 UTC
        ny_time_same = datetime.datetime(2026, 11, 1, 8, 0, tzinfo=ny_tz)
        
        AvailabilityService.block_dates(self.vehicle, utc_time, utc_time + datetime.timedelta(hours=2))
        
        # Searching with NY timezone but same absolute timeframe should detect overlap
        is_avail = AvailabilityService.is_available(
            self.vehicle, 
            ny_time_same, 
            ny_time_same + datetime.timedelta(hours=1)
        )
        self.assertFalse(is_avail)

    def test_release_dates_partial(self):
        # Block 48 hours
        AvailabilityService.block_dates(self.vehicle, self.day1_start, self.day3_start)
        
        # Release the middle 24 hours (day 2)
        AvailabilityService.release_dates(self.vehicle, self.day2_start, self.day3_start)
        
        # Now Day 1 should be blocked, Day 2 should be available
        self.assertFalse(AvailabilityService.is_available(self.vehicle, self.day1_start, self.day2_start))
        self.assertTrue(AvailabilityService.is_available(self.vehicle, self.day2_start, self.day3_start))
        
        # Check DB states directly
        blocks = Availability.objects.filter(vehicle=self.vehicle)
        self.assertEqual(blocks.count(), 1)
        self.assertEqual(blocks.first().start_datetime, self.day1_start)
        self.assertEqual(blocks.first().end_datetime, self.day2_start)

    def test_get_available_ranges(self):
        # Block day 2
        AvailabilityService.block_dates(self.vehicle, self.day2_start, self.day3_start)
        
        ranges = AvailabilityService.get_available_ranges(self.vehicle, self.day1_start, self.day3_end)
        
        self.assertEqual(len(ranges), 2)
        # Range 1: Day 1
        self.assertEqual(ranges[0][0], self.day1_start)
        self.assertEqual(ranges[0][1], self.day2_start)
        # Range 2: Day 3
        self.assertEqual(ranges[1][0], self.day3_start)
        self.assertEqual(ranges[1][1], self.day3_end)
